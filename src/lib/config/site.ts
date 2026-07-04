export const siteConfig = {
  name: "ilhamspace",
  tagline: "Notes, projects, and ideas.",
  description:
    "ilhamspace — a personal site for notes, projects, and ideas.",
  license: "CC-BY-4.0",
  logoPath: "/logo-ilhamspace.jpg",
  defaultOgImagePath: "/logo-ilhamspace.jpg",
} as const;

import { browser } from "$app/environment";

export const getSiteUrl = (): string => {
  if (browser) {
    return window.location.origin;
  }

  const origin = process.env.ORIGIN?.trim();
  if (origin) {
    return origin.replace(/\/$/, "");
  }

  return "http://localhost:5173";
};