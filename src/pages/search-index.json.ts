import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { categorySlug } from '../lib/categories';

// Build-time JSON index for client-side search.
export const GET: APIRoute = async () => {
  const entries = await getCollection('dsa');

  const index = entries.map((e) => ({
    // Full path id — used to build /entry/{slug}/ URLs.
    slug: e.id,
    id: e.id,
    title: e.data.title,
    category: e.data.category,
    categorySlug: categorySlug(e.data.category),
    tags: e.data.tags ?? [],
    difficulty: e.data.difficulty,
    time_complexity: e.data.time_complexity,
    space_complexity: e.data.space_complexity,
    complexity_class: e.data.complexity_class,
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
