import { getUmamiPublicConfig } from "$lib/db/umami-settings";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const umami = await getUmamiPublicConfig();

  return {
    user: locals.user,
    locale: locals.locale,
    umami,
  };
};