import type { UmamiSettings } from "$lib/db/schema";

type LoginCache = {
  key: string;
  token: string;
  expiresAt: number;
};

let loginCache: LoginCache | null = null;

export const resolveUmamiApiBase = (
  settings: Pick<UmamiSettings, "apiUrl" | "scriptUrl">,
): string | null => {
  const apiUrl = settings.apiUrl?.trim();
  if (apiUrl) {
    return apiUrl.replace(/\/$/, "");
  }

  const scriptUrl = settings.scriptUrl?.trim();
  if (!scriptUrl) {
    return null;
  }

  try {
    return new URL(scriptUrl).origin;
  } catch {
    return null;
  }
};

export const hasUmamiApiCredentials = (
  settings: Pick<UmamiSettings, "apiToken" | "apiUsername" | "apiPassword">,
): boolean =>
  Boolean(
    settings.apiToken?.trim() ||
      (settings.apiUsername?.trim() && settings.apiPassword?.trim()),
  );

export const getUmamiAuthToken = async (
  settings: UmamiSettings,
): Promise<string | null> => {
  const staticToken = settings.apiToken?.trim();
  if (staticToken) {
    return staticToken;
  }

  const username = settings.apiUsername?.trim();
  const password = settings.apiPassword?.trim();
  if (!username || !password) {
    return null;
  }

  const apiBase = resolveUmamiApiBase(settings);
  if (!apiBase) {
    return null;
  }

  const cacheKey = `${apiBase}:${username}`;
  if (
    loginCache?.key === cacheKey &&
    loginCache.token &&
    Date.now() < loginCache.expiresAt
  ) {
    return loginCache.token;
  }

  try {
    const response = await fetch(`${apiBase}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      console.error("[umami] login failed:", response.status);
      return null;
    }

    const payload = (await response.json()) as { token?: string };
    if (!payload.token) {
      return null;
    }

    loginCache = {
      key: cacheKey,
      token: payload.token,
      expiresAt: Date.now() + 55 * 60 * 1000,
    };

    return payload.token;
  } catch (error) {
    console.error("[umami] login error:", error);
    return null;
  }
};

export const clearUmamiAuthCache = (): void => {
  loginCache = null;
};