import { getPublishedPosts } from "$lib/db/posts";
import { formatPostPreview } from "$lib/posts/format";
import { getPublishedProjects } from "$lib/server/projects";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const [posts, projects] = await Promise.all([
    getPublishedPosts(),
    getPublishedProjects(),
  ]);

  const lastPost = posts[0];
  const lastProject = projects[0];
  const lastUpdated = [lastPost?.updatedAt, lastProject?.updatedAt]
    .filter((date): date is Date => date instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return {
    recentPosts: posts
      .slice(0, 5)
      .map((post) => formatPostPreview(post, locals.locale)),
    featuredProjects: projects.slice(0, 3).map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      url: project.url,
      iconUrl: project.iconUrl,
    })),
    stats: {
      postCount: posts.length,
      projectCount: projects.length,
      lastUpdated: lastUpdated?.toISOString() ?? null,
    },
  };
};