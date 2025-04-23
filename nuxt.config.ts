// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'path';
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      app: {
        name: "",
      },
      auth: {
        url: "",
        callbackUrl: "",
        clientId: "",
      },
      apiBaseUrl: "",
      socketUrl: "",
    },
  },
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-headlessui",
    "@nuxtjs/i18n",
    "@nuxtjs/color-mode",
    "pinia-plugin-persistedstate",
    "@nuxt/icon",
    "dayjs-nuxt",
    "@nuxtjs/google-fonts",
  ],
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: "#0466FF",
            primaryDark: "#0044CC",
            babyBlue: "#A4C4F7",
          },
        },
        fontFamily: {
          sans: ['"Inter"', 'sans-serif']
        }
      },
    },
    editorSupport: true,
  },
  googleFonts: {
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700],
    },
  },
  i18n: {
    bundle: {
      optimizeTranslationDirective: false,
    },
    strategy: "no_prefix",
    defaultLocale: "en",
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'id', name: 'Indonesia', file: 'id.json' },
      { code: 'zh-Hant-TW', name: '繁體中文', file: 'zh-Hant-TW.json' }
      // "en", "id", "zh-Hant-TW"
    ],

    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_lang",
    },
    // vueI18n: './i18n.config.ts',
  },
  colorMode: {
    storage: "localStorage",
    storageKey: "__app_theme__",
  },
  dayjs: {
    locales: ["en", "id", "zh-tw"],
    plugins: ["relativeTime", "utc", "timezone"],
    defaultLocale: "zh-tw",
    defaultTimezone: "Asia/Taipei",
  },
});