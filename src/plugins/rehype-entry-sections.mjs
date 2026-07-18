// Wraps the content between h2 headings in <section class="entry-section …">
// so every standard section gets its visual treatment automatically.
// The author writes `## Pseudocode` and the styling is free.

const SECTION_STYLES = {
  intuition: 'section-intuition',
  'formal definition': 'section-definition',
  'when to use': 'section-when',
  'when to use it': 'section-when',
  'complexity analysis': 'section-complexity',
  pseudocode: 'section-pseudocode',
  implementation: 'section-implementation',
  'worked example': 'section-example',
  'common mistakes': 'section-mistakes',
  'common pitfalls': 'section-mistakes',
  'see also': 'section-related',
};

export function rehypeEntrySections() {
  return (tree) => {
    const children = tree.children;
    const result = [];
    let currentSection = null;
    let currentClass = '';

    for (const node of children) {
      if (node.type === 'element' && node.tagName === 'h2') {
        // close the previous section
        if (currentSection) {
          result.push({
            type: 'element',
            tagName: 'section',
            properties: { className: ['entry-section', currentClass] },
            children: currentSection,
          });
        }
        currentSection = [node];
        const headingText = getTextContent(node).toLowerCase().trim();
        currentClass = SECTION_STYLES[headingText] ?? 'section-default';
      } else if (currentSection) {
        currentSection.push(node);
      } else {
        result.push(node);
      }
    }

    // close the last section
    if (currentSection) {
      result.push({
        type: 'element',
        tagName: 'section',
        properties: { className: ['entry-section', currentClass] },
        children: currentSection,
      });
    }

    tree.children = result;
  };
}

function getTextContent(node) {
  if (node.type === 'text') return node.value;
  let text = '';
  if (node.children) {
    for (const child of node.children) text += getTextContent(child);
  }
  return text;
}
