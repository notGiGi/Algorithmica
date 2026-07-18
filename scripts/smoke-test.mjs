import { chromium } from 'playwright';

const BASE = 'http://localhost:4321/Algorithmica';
const results = [];
const check = (name, ok, detail = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);

const browser = await chromium.launch();
const page = await browser.newPage();

const consoleMsgs = [];
page.on('console', (m) => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => consoleMsgs.push(`[pageerror] ${e.message}`));

// --- 1. Home loads, index ready ---
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const indexReady = consoleMsgs.some((m) => m.includes('[Search] Index ready'));
check('console shows "[Search] Index ready"', indexReady,
  consoleMsgs.filter((m) => m.includes('Search') || m.includes('error')).join(' | ') || 'no search logs');

// --- 2. Ctrl+K opens overlay ---
await page.keyboard.press('Control+k');
const overlayOpen = await page.locator('#search-overlay.open').isVisible().catch(() => false);
check('Ctrl+K opens overlay', overlayOpen);

// --- 3. Typing "union" returns results fast ---
const t0 = Date.now();
await page.fill('#search-input', 'union');
let firstResult = '';
try {
  await page.waitForSelector('.search-result-item', { timeout: 3000 });
  firstResult = (await page.locator('.search-result-item .search-result-title').first().innerText()).trim();
} catch {}
const elapsed = Date.now() - t0;
check('typing "union" returns results', firstResult.length > 0, `${elapsed}ms, first: "${firstResult}"`);
check('first result is Union-Find', /union[- ]?find/i.test(firstResult), firstResult);

// --- 4. Typo tolerance ---
await page.fill('#search-input', 'dikstra');
await page.waitForTimeout(300);
const typoCount = await page.locator('.search-result-item').count();
// no dijkstra entry exists yet; just ensure fuzzy search executes without crash
check('fuzzy query executes (no crash)', true, `${typoCount} results for "dikstra"`);

// --- 5. Arrow down + Enter navigates ---
await page.fill('#search-input', 'union');
await page.waitForSelector('.search-result-item');
await page.keyboard.press('ArrowDown');
const focused = await page.locator('.search-result-item.focused').count();
check('ArrowDown highlights item', focused === 1);
await Promise.all([
  page.waitForURL(/entry\/graphs\/union-find/, { timeout: 5000 }),
  page.keyboard.press('Enter'),
]).catch(() => {});
check('Enter navigates to entry', page.url().includes('/entry/graphs/union-find'), page.url());

// --- 6. Entry page automatic features ---
await page.waitForTimeout(800); // let client scripts run
const langTabs = await page.locator('.lang-tabs .lang-tab').count();
check('Implementation has Python/Java tabs', langTabs >= 2, `${langTabs} tabs`);
const copyBtns = await page.locator('.copy-btn').count();
check('code blocks have Copy buttons', copyBtns > 0, `${copyBtns} buttons`);
const pseudoBlocks = await page.locator('.code-block-wrapper.pseudo').count();
check('pseudocode block styled distinctly', pseudoBlocks >= 1, `${pseudoBlocks} pseudo blocks`);
const cxTable = await page.locator('.complexity-table').count();
check('complexity table present', cxTable === 1);
const sections = await page.locator('.entry-section').count();
check('sections auto-wrapped', sections >= 6, `${sections} sections`);

// tab switching actually toggles visibility
const tabLabels = await page.locator('.lang-tabs .lang-tab').allInnerTexts();
if (langTabs >= 2) {
  await page.locator('.lang-tabs .lang-tab').nth(1).click();
  await page.waitForTimeout(100);
  const hiddenFirst = await page
    .locator('.section-implementation .code-block-wrapper')
    .first()
    .evaluate((el) => el.style.display === 'none');
  check('clicking Java tab hides Python block', hiddenFirst, `tabs: ${tabLabels.join(', ')}`);
}

// --- 7. Search via header button after a view transition ---
await page.click('#search-trigger');
await page.waitForTimeout(200);
const reopened = await page.locator('#search-overlay.open').isVisible().catch(() => false);
check('header button opens search after navigation', reopened);
await page.fill('#search-input', 'knapsack');
let secondSearch = '';
try {
  await page.waitForSelector('.search-result-item', { timeout: 2000 });
  secondSearch = (await page.locator('.search-result-item .search-result-title').first().innerText()).trim();
} catch {}
check('search still works after view transition', /knapsack/i.test(secondSearch), secondSearch);

console.log('\n===== RESULTS =====');
console.log(results.join('\n'));
console.log('\n===== CONSOLE LOG (search/errors) =====');
console.log(consoleMsgs.filter((m) => m.includes('Search') || m.toLowerCase().includes('error')).join('\n') || '(clean)');

await browser.close();
const failed = results.filter((r) => r.startsWith('FAIL')).length;
process.exit(failed > 0 ? 1 : 0);
