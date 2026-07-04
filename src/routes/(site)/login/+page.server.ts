import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

import { SESSION_COOKIE } from "$lib/auth/constants";
import { verifyPassword } from "$lib/auth/password";
import { checkRateLimit } from "$lib/auth/rate-limit";
import { createSession } from "$lib/auth/session";
import { db } from "$lib/db/index";
import { users } from "$lib/db/schema";
import { loginSchema } from "$lib/schemas/auth";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user?.isAdmin) {
    throw redirect(303, "/admin");
  }
};

export const actions: Actions = {
  default: async (event) => {
    const clientIp = event.getClientAddress();
    if (!checkRateLimit(`login:${clientIp}`)) {
      return fail(429, {
        error: "Too many attempts. Try again in 15 minutes.",
        email: "",
      });
    }

    const formData = await event.request.formData();
    const raw = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        error: "Invalid email or password.",
        email: raw.email,
      });
    }

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    const user = rows[0];

    if (!user?.isAdmin || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return fail(401, {
        error: "Invalid email or password.",
        email: parsed.data.email,
      });
    }

    const { token, expiresAt } = await createSession(user.id);

    event.cookies.set(SESSION_COOKIE, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
    });

    throw redirect(303, "/admin");
  },
};