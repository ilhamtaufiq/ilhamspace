export const fetchViewCount = async (path: string): Promise<number | null> => {
  try {
    const response = await fetch(
      `/api/stats/views?path=${encodeURIComponent(path)}`,
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { views: number | null };
    return typeof payload.views === "number" ? payload.views : null;
  } catch {
    return null;
  }
};

export const fetchViewCounts = async (
  paths: string[],
): Promise<Record<string, number | null>> => {
  if (paths.length === 0) {
    return {};
  }

  try {
    const response = await fetch(
      `/api/stats/views?paths=${encodeURIComponent(paths.join(","))}`,
    );

    if (!response.ok) {
      return {};
    }

    const payload = (await response.json()) as {
      views: Record<string, number | null>;
    };

    return payload.views ?? {};
  } catch {
    return {};
  }
};