// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://actionzonecma.com',

  vite: {
    plugins: [tailwindcss()]
  },

  // Pages marked noindex (BaseLayout `noindex`) stay out of the sitemap too.
  integrations: [
    sitemap({
      filter: (page) =>
        !["/404", "/family-login", "/contact/sent", "/privacy", "/sms-terms"].some((p) =>
          new URL(page).pathname.replace(/\/$/, "").endsWith(p)
        ),
    }),
  ],

  // The site stylesheet is small (~8.5 KB), so inline it into each page rather
  // than making the browser wait on a separate render-blocking request.
  build: {
    inlineStylesheets: 'always'
  },

  // Self-host the Google Fonts at build time. Removes the render-blocking
  // fonts.googleapis.com stylesheet (and the extra third-party connection),
  // which was holding back the hero text (our LCP element) on mobile.
  // Same families, weights, and Fraunces optical-size axis as before.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      weights: [400, 600, 900],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['serif'],
      options: { experimental: { variableAxis: { opsz: [['9', '144']] } } }
    },
    {
      provider: fontProviders.google(),
      name: 'Archivo',
      cssVariable: '--font-archivo',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif']
    }
  ],

  // Every image-bearing page is prerendered, so optimize images at build time
  // with Sharp (real static AVIF/WebP files) instead of the adapter's default
  // runtime `/_image` endpoint, which would need a Cloudflare Images binding.
  adapter: cloudflare({ imageService: "compile" })
});
