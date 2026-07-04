import { redirect } from "@sveltejs/kit";

import { handleCreateProject } from "$lib/server/project-actions";

import type { Actions } from "./$types";

export const actions: Actions = {
  save: async ({ request }) => {
    const formData = await request.formData();
    const result = await handleCreateProject(formData);

    if ("status" in result) {
      return result;
    }

    throw redirect(303, `/admin/projects/${result.id}/edit`);
  },
};