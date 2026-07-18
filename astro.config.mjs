import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { rehypeEntrySections } from './src/plugins/rehype-entry-sections.mjs';

// Publica en https://notGiGi.github.io/Algorithmica.
// Si algún día usas dominio propio o el repo <usuario>.github.io, pon base: '/'.
const GITHUB_USER = 'notGiGi';

// Tema de sintaxis custom — cálido, consistente con la paleta del sitio.
const opusDark = {
  name: 'opus-dark',
  type: 'dark',
  colors: {
    'editor.background': '#141312',
    'editor.foreground': '#E6E3DC',
  },
  tokenColors: [
    {
      scope: ['keyword', 'storage'],
      settings: { foreground: '#C4785A', fontStyle: 'bold' },
    },
    {
      scope: ['string', 'string.quoted'],
      settings: { foreground: '#8FAF6B' },
    },
    {
      scope: ['comment'],
      settings: { foreground: '#534F49', fontStyle: 'italic' },
    },
    {
      scope: ['constant.numeric'],
      settings: { foreground: '#C4923A' },
    },
    {
      scope: ['entity.name.function', 'support.function'],
      settings: { foreground: '#E0A080' },
    },
    {
      scope: ['entity.name.type', 'support.type', 'support.class'],
      settings: { foreground: '#8FAFC4' },
    },
    {
      scope: ['variable.parameter'],
      settings: { foreground: '#D4B896' },
    },
    {
      scope: ['punctuation'],
      settings: { foreground: '#6E6A63' },
    },
    {
      scope: ['meta.function-call'],
      settings: { foreground: '#E0A080' },
    },
    {
      scope: ['constant.language', 'constant.other'],
      settings: { foreground: '#C4923A' },
    },
  ],
};

export default defineConfig({
  site: `https://${GITHUB_USER}.github.io`,
  base: '/Algorithmica',
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeEntrySections],
    shikiConfig: {
      theme: opusDark,
      langs: ['python', 'java', 'typescript', 'bash', 'latex'],
      // ```pseudo fences render as plaintext but keep data-language="pseudo"
      langAlias: { pseudo: 'plaintext' },
    },
  },
});
