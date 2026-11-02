// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import siteSearch from './src/integrations/site-search.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.tantanteatro.it',
  integrations: [sitemap({ filter: (page) => !page.includes('/lab/') }), siteSearch()],
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    routing: {
      prefixDefaultLocale: false
    }
  }
});