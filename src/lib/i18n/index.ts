import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
} from "$lib/i18n/constants";

export type { Locale } from "$lib/i18n/constants";
export {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  SUPPORTED_LOCALES,
} from "$lib/i18n/constants";
import en from "$lib/i18n/messages/en";
import id from "$lib/i18n/messages/id";

export type MessageKey = keyof typeof id;

export type TranslateVars = Record<string, string | number>;

const catalogs: Record<Locale, Record<MessageKey, string>> = { id, en };

export const parseLocale = (value: string | null | undefined): Locale => {
  if (value && SUPPORTED_LOCALES.includes(value as Locale)) {
    return value as Locale;
  }
  return DEFAULT_LOCALE;
};

export const getDateLocale = (locale: Locale): string =>
  locale === "id" ? "id-ID" : "en-US";

export const translate = (
  locale: Locale,
  key: MessageKey,
  vars?: TranslateVars,
): string => {
  let text = catalogs[locale][key] ?? catalogs[DEFAULT_LOCALE][key] ?? key;

  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }

  return text;
};

export const createTranslator = (locale: Locale) => {
  return (key: MessageKey, vars?: TranslateVars): string =>
    translate(locale, key, vars);
};

export type Translator = ReturnType<typeof createTranslator>;