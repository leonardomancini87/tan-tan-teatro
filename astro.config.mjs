// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.tantanteatro.it',
  integrations: [sitemap()],
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    routing: {
      prefixDefaultLocale: false
    }
  }
});