import { fail } from "@sveltejs/kit";

import {
  getUmamiSettings,
  saveUmamiSettings,
} from "$lib/db/umami-settings";
import { umamiSettingsFormSchema } from "$lib/schemas/umami";
import { hasUmamiApiCredentials } from "$lib/server/umami-auth";
import {
  clearUmamiViewCache,
  deriveUmamiScriptUrl,
  testUmamiConnection,
} from "$lib/server/umami";

import type { Actions, PageServerLoad } from "./$types";

const emptyToNull = (value: string): string | null =>
  value.trim() === "" ? null : value.trim();

const resolveApiUrl = (
  apiUrl: string | null,
  scriptUrl: string | null,
): string | null => {
  if (apiUrl) {
    return apiUrl;
  }

  if (!scriptUrl) {
    return null;
  }

  try {
    return new URL(scriptUrl).origin;
  } catch {
    return null;
  }
};

export const load: PageServerLoad = async () => {
  const settings = await getUmamiSettings();

  return {
    settings: {
      enabled: settings?.enabled ?? false,
      scriptUrl: settings?.scriptUrl ?? "",
      websiteId: settings?.websiteId ?? "",
      apiUrl: settings?.apiUrl ?? "",
      apiUsername: settings?.apiUsername ?? "",
      hasApiToken: Boolean(settings?.apiToken),
      hasApiPassword: Boolean(settings?.apiPassword),
    },
  };
};

export const actions: Actions = {
  saveUmami: async ({ request }) => {
    const formData = await request.formData();
    const parsed = umamiSettingsFormSchema.safeParse({
      enabled: formData.get("enabled"),
      scriptUrl: formData.get("scriptUrl"),
      websiteId: formData.get("websiteId"),
      apiUrl: formData.get("apiUrl"),
      apiToken: formData.get("apiToken"),
      apiUsername: formData.get("apiUsername"),
      apiPassword: formData.get("apiPassword"),
    });

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid Umami settings.";
      return fail(400, { saveError: message });
    }

    const existing = await getUmamiSettings();
    const scriptUrl =
      emptyToNull(parsed.data.scriptUrl) ??
      (emptyToNull(parsed.data.apiUrl)
        ? deriveUmamiScriptUrl(parsed.data.apiUrl)
        : null);
    const apiUrl = resolveApiUrl(
      emptyToNull(parsed.data.apiUrl),
      scriptUrl,
    );
    const apiToken =
      emptyToNull(parsed.data.apiToken) ?? existing?.apiToken ?? null;
    const apiUsername =
      emptyToNull(parsed.data.apiUsername) ?? existing?.apiUsername ?? null;
    const apiPassword =
      emptyToNull(parsed.data.apiPassword) ?? existing?.apiPassword ?? null;

    const saved = await saveUmamiSettings({
      enabled: parsed.data.enabled,
      scriptUrl,
      websiteId: emptyToNull(parsed.data.websiteId),
      apiUrl,
      apiToken,
      apiUsername,
      apiPassword,
    });

    if (!saved) {
      return fail(500, { saveError: "Could not save settings." });
    }

    clearUmamiViewCache();

    if (
      parsed.data.enabled &&
      !hasUmamiApiCredentials({
        apiToken,
        apiUsername,
        apiPassword,
      })
    ) {
      return {
        saveSuccess: true,
        saveWarning:
          "Tracking saved. Add API token or Umami login below for view counts.",
      };
    }

    return { saveSuccess: true };
  },

  testUmami: async () => {
    const result = await testUmamiConnection();
    if (!result.ok) {
      return fail(400, { testError: result.message });
    }

    return {
      testSuccess: true,
      testViews: result.views,
    };
  },
};