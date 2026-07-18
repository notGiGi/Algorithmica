import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const dsaCollection = defineCollection({
  // Astro 5 content layer: cargamos los .md desde src/content/dsa.
  // El id de cada entrada es su ruta relativa sin extensión, p.ej. "arrays/two-pointers".
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/dsa' }),
  schema: z.object({
    title: z.string(),
    category: z.enum([
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
    ]),
    tags: z.array(z.string()).default([]),
    difficulty: z
      .enum(['foundational', 'intermediate', 'advanced'])
      .default('intermediate'),
    time_complexity: z.string(), // e.g. "O(n log n)"
    space_complexity: z.string(), // e.g. "O(1)"
    // One-line justification shown in the complexity table (optional).
    time_note: z.string().optional(),
    space_note: z.string().optional(),
    // good = verde, ok = ámbar, heavy = rojo
    complexity_class: z.enum(['good', 'ok', 'heavy']).default('ok'),
    date_added: z.coerce.date(),
    last_updated: z.coerce.date().optional(),
    related: z.array(z.string()).default([]), // ids de otras entradas
    leetcode_problems: z
      .array(
        z.object({
          name: z.string(),
          number: z.number(),
          difficulty: z.enum(['easy', 'medium', 'hard']),
        })
      )
      .default([]),
    svg_type: z
      .enum([
        'array',
        'linked-list',
        'tree',
        'graph',
        'heap',
        'stack',
        'queue',
        'none',
      ])
      .default('none'),
  }),
});

export const collections = { dsa: dsaCollection };
