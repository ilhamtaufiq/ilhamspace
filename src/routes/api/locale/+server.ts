import { redirect } from "@sveltejs/kit";

import { LOCALE_COOKIE } from "$lib/i18n/constants";
import { parseLocale } from "$lib/i18n";

import type { RequestHandler } from "./$types";

const safeRedirectPath = (value: string | null): string => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
};

export const GET: RequestHandler = async ({ url, cookies }) => {
  const locale = parseLocale(url.searchParams.get("locale"));
  const redirectTo = safeRedirectPath(url.searchParams.get("redirect"));

  cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  throw redirect(303, redirectTo);
};