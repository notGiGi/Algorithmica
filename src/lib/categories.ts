// Mapeo entre el nombre de categoría (el que valida el schema) y su slug de URL.
// El slug se usa para las rutas /graphs/, /dynamic-programming/, etc.

export const CATEGORIES = [
  'Arrays & Strings',
  'Linked Lists',
  'Stacks & Queues',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Backtracking',
  'Binary Search',
  'Heaps',
  'Sorting',
  'Math & Bits',
  'Analysis',
] as const;

export type Category = (typeof CATEGORIES)[number];

// Etiquetas cortas para las pestañas del índice.
export const CATEGORY_SHORT: Record<Category, string> = {
  'Arrays & Strings': 'Arrays',
  'Linked Lists': 'Linked Lists',
  'Stacks & Queues': 'Stacks & Queues',
  Trees: 'Trees',
  Graphs: 'Graphs',
  'Dynamic Programming': 'DP',
  Backtracking: 'Backtracking',
  'Binary Search': 'Binary Search',
  Heaps: 'Heaps',
  Sorting: 'Sorting',
  'Math & Bits': 'Math & Bits',
  Analysis: 'Analysis',
};

// Distinct accent per category — icon + color for section headers.
export const CATEGORY_META: Record<Category, { color: string; icon: string }> = {
  'Arrays & Strings': { color: '#C4785A', icon: '[ ]' },
  Graphs: { color: '#6B8FA8', icon: '◉—◉' },
  Trees: { color: '#6B9B6B', icon: '⌥' },
  'Dynamic Programming': { color: '#C4923A', icon: '▦' },
  Backtracking: { color: '#B85C4A', icon: '↩' },
  'Binary Search': { color: '#8FAFC4', icon: '⟨⟩' },
  Heaps: { color: '#9B7A3A', icon: '△' },
  Sorting: { color: '#8F7AC4', icon: '↕' },
  'Math & Bits': { color: '#C48A6B', icon: '∑' },
  'Linked Lists': { color: '#7AC4B0', icon: '○→○' },
  'Stacks & Queues': { color: '#C4A06B', icon: '⬚' },
  Analysis: { color: '#8A8A8A', icon: 'Ω' },
};

export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function categoryFromSlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => categorySlug(c) === slug);
}
