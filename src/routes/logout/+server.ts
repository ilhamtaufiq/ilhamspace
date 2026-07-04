import { redirect } from "@sveltejs/kit";

import { SESSION_COOKIE } from "$lib/auth/constants";
import { deleteSession } from "$lib/auth/session";

import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get(SESSION_COOKIE);

  if (token) {
    await deleteSession(token);
  }

  cookies.delete(SESSION_COOKIE, { path: "/" });

  throw redirect(303, "/");
};