// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  // The site is the studio account's user page, so it is served from the root: no `base`.
  site: "https://blue-meteor-studio.github.io",

  // English lives at the root, Korean under /ko/.
  i18n: {
    locales: ["en", "ko"],
    defaultLocale: "en",
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", ko: "ko" },
      },
    }),
  ],

  // The display face. The files are in the repository (src/assets/fonts), so a build fetches nothing.
  // Korean text falls through to the reader's own system font.
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Barlow Condensed",
      cssVariable: "--font-barlow-condensed",
      fallbacks: ["sans-serif"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/barlow-condensed-latin-600-normal.woff2"],
            weight: 600,
            style: "normal",
          },
          {
            src: ["./src/assets/fonts/barlow-condensed-latin-800-normal.woff2"],
            weight: 800,
            style: "normal",
          },
          {
            src: ["./src/assets/fonts/barlow-condensed-latin-800-italic.woff2"],
            weight: 800,
            style: "italic",
          },
        ],
      },
    },
  ],
});
