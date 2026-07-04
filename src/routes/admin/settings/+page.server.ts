import { fail } from "@sveltejs/kit";

import {
  getUmamiSettings,
  saveUmamiSettings,
} from "$lib/db/umami-settings";
import { umamiSettingsFormSchema } from "$lib/schemas/umami";
import {
  clearUmamiViewCache,
  testUmamiConnection,
} from "$lib/server/umami";

import type { Actions, PageServerLoad } from "./$types";

const emptyToNull = (value: string): string | null =>
  value.trim() === "" ? null : value.trim();

export const load: PageServerLoad = async () => {
  const settings = await getUmamiSettings();

  return {
    settings: {
      enabled: settings?.enabled ?? false,
      scriptUrl: settings?.scriptUrl ?? "",
      websiteId: settings?.websiteId ?? "",
      apiUrl: settings?.apiUrl ?? "",
      hasApiToken: Boolean(settings?.apiToken),
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
    });

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Invalid Umami settings.";
      return fail(400, { saveError: message });
    }

    const existing = await getUmamiSettings();
    const apiToken =
      emptyToNull(parsed.data.apiToken) ?? existing?.apiToken ?? null;

    if (parsed.data.enabled && parsed.data.apiUrl && !apiToken) {
      return fail(400, {
        saveError: "API token is required to display view counts.",
      });
    }

    const saved = await saveUmamiSettings({
      enabled: parsed.data.enabled,
      scriptUrl: emptyToNull(parsed.data.scriptUrl),
      websiteId: emptyToNull(parsed.data.websiteId),
      apiUrl: emptyToNull(parsed.data.apiUrl),
      apiToken,
    });

    if (!saved) {
      return fail(500, { saveError: "Could not save settings." });
    }

    clearUmamiViewCache();
    return { saveSuccess: true };
  },

  testUmami: async () => {
    const result = await testUmamiConnection();
    if (!result.ok) {
      return fail(400, { testError: result.message });
    }

    return { testSuccess: true };
  },
};