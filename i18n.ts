import { getRequestConfig } from "next-intl/server";
import { availableLocaleCodes } from "@/next.locales.mjs";

// Loads the Application Locales/Translations Dynamically
const loadLocaleDictionary = async (locale: string) => {
  switch (locale) {
    case "en":
      return await import("@/i18n/locales/en.json").then((f) => f.default);
    case "pt":
      return await import("@/i18n/locales/pt.json").then((f) => f.default);
    default:
      if (availableLocaleCodes.includes(locale)) {
        return await import(`./i18n/locales/${locale}.json`).then(
          (f) => f.default,
        );
      } else {
        throw new Error(`Unsupported locale: ${locale}`);
      }
  }
};

// Provides `next-intl` configuration for RSC/SSR
export default getRequestConfig(async ({ locale }) => ({
  // This is the dictionary of messages to be loaded
  messages: await loadLocaleDictionary(locale),
  // We always define the App timezone as UTC
  timeZone: "Etc/UTC",
}));
