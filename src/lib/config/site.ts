export const siteConfig = {
  name: "ilhamspace",
  tagline: "Notes, projects, and ideas.",
  description:
    "ilhamspace — a personal site for notes, projects, and ideas.",
  license: "CC-BY-4.0",
} as const;

export const getSiteUrl = (): string => {
  const origin = process.env.ORIGIN?.trim();
  if (origin) {
    return origin.replace(/\/$/, "");
  }
  return "http://localhost:5173";
};