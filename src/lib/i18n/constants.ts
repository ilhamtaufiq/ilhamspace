export const LOCALE_COOKIE = "locale" as const;

export const DEFAULT_LOCALE = "id" as const;

export const SUPPORTED_LOCALES = ["id", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];