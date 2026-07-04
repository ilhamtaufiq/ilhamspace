import { deleteProject, getAllProjects } from "$lib/server/projects";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const projects = await getAllProjects();
  return { projects };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");

    if (!id) {
      return { success: false };
    }

    await deleteProject(id);
    return { success: true };
  },
};