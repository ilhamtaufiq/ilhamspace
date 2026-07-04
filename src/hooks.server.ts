import { redirect } from "@sveltejs/kit";

import { SESSION_COOKIE } from "$lib/auth/constants";
import { getUserFromSession } from "$lib/auth/session";
import { LOCALE_COOKIE } from "$lib/i18n/constants";
import { parseLocale } from "$lib/i18n";

import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get(SESSION_COOKIE);
  event.locals.user = token ? await getUserFromSession(token) : null;
  event.locals.locale = parseLocale(event.cookies.get(LOCALE_COOKIE));

  const { pathname } = event.url;

  if (pathname.startsWith("/admin") && !event.locals.user?.isAdmin) {
    throw redirect(303, "/login");
  }

  return resolve(event);
};