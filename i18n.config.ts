import en from "~/locales/en.json";
import id from "~/locales/id.json";
import zhHantTW from "~/locales/zh-Hant-TW.json";
export default defineI18nConfig(() => ({
  globalInjection: true,
  messages: {
    en,
    id,
    "zh-Hant-TW": zhHantTW,
  },
}));
