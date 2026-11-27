// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Sitio estático con Tailwind v4 compilado en build (sin CDN).
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
