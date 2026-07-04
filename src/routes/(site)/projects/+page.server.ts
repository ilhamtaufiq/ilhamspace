import { getPublishedProjects } from "$lib/server/projects";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const projects = await getPublishedProjects();
  return { projects };
};