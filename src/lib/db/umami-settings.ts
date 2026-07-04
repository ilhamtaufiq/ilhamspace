import { eq } from "drizzle-orm";

import { db } from "$lib/db/index";
import { type UmamiSettings, umamiSettings } from "$lib/db/schema";

const SETTINGS_ID = "default";

export type UmamiPublicConfig = {
  enabled: boolean;
  scriptUrl: string | null;
  websiteId: string | null;
};

export type UmamiSettingsInput = {
  enabled: boolean;
  scriptUrl: string | null;
  websiteId: string | null;
  apiUrl: string | null;
  apiToken: string | null;
};

const toPublicConfig = (row: UmamiSettings | null): UmamiPublicConfig => ({
  enabled: Boolean(row?.enabled && row.scriptUrl && row.websiteId),
  scriptUrl: row?.scriptUrl ?? null,
  websiteId: row?.websiteId ?? null,
});

export const getUmamiSettings = async (): Promise<UmamiSettings | null> => {
  try {
    const rows = await db
      .select()
      .from(umamiSettings)
      .where(eq(umamiSettings.id, SETTINGS_ID))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    console.error("[db/umami-settings] fetch error:", error);
    return null;
  }
};

export const getUmamiPublicConfig = async (): Promise<UmamiPublicConfig> => {
  const row = await getUmamiSettings();
  return toPublicConfig(row);
};

export const isUmamiStatsConfigured = (row: UmamiSettings | null): boolean =>
  Boolean(row?.enabled && row.apiUrl && row.apiToken && row.websiteId);

export const saveUmamiSettings = async (
  input: UmamiSettingsInput,
): Promise<UmamiSettings | null> => {
  try {
    const now = new Date();
    const existing = await getUmamiSettings();

    const values = {
      id: SETTINGS_ID,
      enabled: input.enabled,
      scriptUrl: input.scriptUrl,
      websiteId: input.websiteId,
      apiUrl: input.apiUrl,
      apiToken: input.apiToken,
      updatedAt: now,
    };

    if (existing) {
      const rows = await db
        .update(umamiSettings)
        .set(values)
        .where(eq(umamiSettings.id, SETTINGS_ID))
        .returning();

      return rows[0] ?? null;
    }

    const rows = await db.insert(umamiSettings).values(values).returning();
    return rows[0] ?? null;
  } catch (error) {
    console.error("[db/umami-settings] save error:", error);
    return null;
  }
};