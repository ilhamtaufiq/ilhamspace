import { error, redirect } from "@sveltejs/kit";

import { handleUpdateProject } from "$lib/server/project-actions";
import { deleteProject, getProjectById } from "$lib/server/projects";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const project = await getProjectById(params.id);
  if (!project) {
    error(404, "Project not found");
  }

  return {
    project: {
      id: project.id,
      title: project.title,
      description: project.description ?? "",
      url: project.url,
      iconUrl: project.iconUrl ?? "",
      language: project.language ?? "",
      languageColor: project.languageColor ?? "",
      sortOrder: project.sortOrder,
      status: project.status,
    },
  };
};

export const actions: Actions = {
  save: async ({ request, params }) => {
    const formData = await request.formData();
    const result = await handleUpdateProject(params.id, formData);

    if ("status" in result) {
      return result;
    }

    return { success: true };
  },
  delete: async ({ params }) => {
    await deleteProject(params.id);
    throw redirect(303, "/admin/projects");
  },
};