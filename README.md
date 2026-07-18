# DSA Library

Personal reference on algorithms and data structures.
`https://notGiGi.github.io/Algorithmica`

---

## Adding a new entry — 3 steps

**Step 1** — Copy the template:

```bash
cp TEMPLATE.md src/content/dsa/{category}/{entry-name}.md
```

Category folders: `arrays/`, `graphs/`, `trees/`, `dynamic-programming/`,
`backtracking/`, `binary-search/`, `heaps/`, `sorting/`, `math-bits/`, `analysis/`,
`linked-lists/`, `stacks-queues/`

**Step 2** — Fill in the frontmatter fields at the top of the file.
Every field has a comment explaining the valid values.

**Step 3** — Write your content using these section headings (copy from TEMPLATE.md):

- `## Intuition`
- `## Formal Definition`
- `## When to Use It`
- `## Complexity Analysis`
- `## Pseudocode`
- `## Implementation`
- `## Worked Example`
- `## Common Mistakes`

Then push:

```bash
git add . && git commit -m "add: Entry Name" && git push
```

The site updates in ~2 minutes. The styling is automatic — you just write.

---

## Rules for consistent entries

These rules make every entry look identical without any manual formatting:

1. **Section headings must match exactly** — copy them from TEMPLATE.md.
   `## Pseudocode` not `## Pseudo code` or `## Pseudocode:`.

2. **Pseudocode blocks use the ` ```pseudo ` language tag** — not ` ```text `
   or ` ```plaintext `.

3. **Python comes before Java** in the Implementation section — the tab
   switcher expects this order.

4. **Complexity Analysis format:**

   ```
   **Time: `O(n)`** — one sentence explaining why.
   **Space: `O(1)`** — one sentence explaining why.
   ```

5. **Math:** `$inline$` for inline, `$$block$$` for display equations.
   Both render automatically.

6. **The frontmatter `complexity_class` must match the actual complexity:**
   - `good` for O(1), O(log n), O(n)
   - `ok` for O(n log n)
   - `heavy` for O(n²) or worse

That's it. Everything else is automatic.

---

## Deployment

Published to GitHub Pages at `https://notGiGi.github.io/Algorithmica` via
`.github/workflows/deploy.yml`. One-time: on GitHub, set
**Settings → Pages → Build and deployment → Source: GitHub Actions**.
Every push to `main` rebuilds and republishes.

## Local development

```bash
npm install
npm run dev       # http://localhost:4321/Algorithmica
npm run build     # production build → dist/
npm run preview   # serve the production build
npm test          # browser smoke test (dev server must be running)
```
