import { fail, type ActionFailure } from "@sveltejs/kit";

import {
  projectFormSchema,
  type ProjectActionFailure,
  type ProjectFormInput,
} from "$lib/schemas/project";
import { createProject, updateProject } from "$lib/server/projects";

const readProjectForm = (formData: FormData): ProjectFormInput => ({
  title: String(formData.get("title") ?? ""),
  description: String(formData.get("description") ?? "") || undefined,
  url: String(formData.get("url") ?? ""),
  iconUrl: String(formData.get("iconUrl") ?? ""),
  language: String(formData.get("language") ?? "") || undefined,
  languageColor: String(formData.get("languageColor") ?? ""),
  sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  status: String(formData.get("status") ?? "draft") as ProjectFormInput["status"],
});

const failProject = (
  status: 400 | 500,
  payload: ProjectActionFailure,
): ActionFailure<ProjectActionFailure> => fail(status, payload);

export const handleCreateProject = async (
  formData: FormData,
): Promise<
  { success: true; id: string } | ActionFailure<ProjectActionFailure>
> => {
  const raw = readProjectForm(formData);
  const parsed = projectFormSchema.safeParse(raw);
  if (!parsed.success) {
    return failProject(400, {
      error: "Please check all fields.",
      ...raw,
    });
  }

  const project = await createProject(parsed.data);
  if (!project) {
    return failProject(500, {
      error: "Failed to create project.",
      ...parsed.data,
    });
  }

  return { success: true, id: project.id };
};

export const handleUpdateProject = async (
  id: string,
  formData: FormData,
): Promise<
  { success: true } | ActionFailure<ProjectActionFailure>
> => {
  const raw = readProjectForm(formData);
  const parsed = projectFormSchema.safeParse(raw);
  if (!parsed.success) {
    return failProject(400, {
      error: "Please check all fields.",
      ...raw,
    });
  }

  const project = await updateProject(id, parsed.data);
  if (!project) {
    return failProject(500, {
      error: "Failed to update project.",
      ...parsed.data,
    });
  }

  return { success: true };
};