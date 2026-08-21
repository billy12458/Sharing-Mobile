import { createI18n } from "vue-i18n";
import { messages } from "./locales";
import { getSavedLanguage } from "./utils/storage";

const i18n = createI18n({
  legacy: false,
  locale: getSavedLanguage() || "zh-CN",
  fallbackLocale: "en-US",
  messages,
});

export default i18n;
