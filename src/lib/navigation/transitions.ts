export type NavTransitionType =
  | "nav-forward"
  | "nav-back"
  | "nav-lateral"
  | "fade";

export const getTransitionType = (
  from: URL,
  to: URL,
): NavTransitionType => {
  const fromPath = from.pathname;
  const toPath = to.pathname;

  if (fromPath.startsWith("/notes/") && toPath === "/notes") {
    return "nav-back";
  }

  if (fromPath === "/notes" && toPath.startsWith("/notes/")) {
    return "nav-forward";
  }

  if (fromPath !== toPath) {
    return "nav-lateral";
  }

  return "fade";
};

export const noteTitleTransitionName = (slug: string): string =>
  `note-title-${slug}`;