import { getContext, setContext } from "svelte";

import { translate, type Locale, type Translator } from "$lib/i18n";

const LOCALE_CONTEXT = Symbol("locale");

export type LocaleContext = {
  locale: Locale;
  t: Translator;
};

export const setLocaleContext = (
  getLocale: () => Locale,
): LocaleContext => {
  const context: LocaleContext = {
    get locale() {
      return getLocale();
    },
    t(key, vars) {
      return translate(getLocale(), key, vars);
    },
  };
  setContext(LOCALE_CONTEXT, context);
  return context;
};

export const getLocaleContext = (): LocaleContext => {
  const context = getContext<LocaleContext | undefined>(LOCALE_CONTEXT);
  if (!context) {
    throw new Error("Locale context is not available on this page.");
  }
  return context;
};