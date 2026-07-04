export type Theme = "dark" | "light";

export const resolveTheme = (
  stored: string | null,
  prefersDark: boolean,
): Theme => {
  if (stored === "dark") {
    return "dark";
  }
  if (stored === "light") {
    return "light";
  }
  return prefersDark ? "dark" : "light";
};

export const applyTheme = (theme: Theme): void => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export const readTheme = (): Theme => {
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  return resolveTheme(stored, prefersDark);
};

export const toggleTheme = (): Theme => {
  const next: Theme = document.documentElement.classList.contains("dark")
    ? "light"
    : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
  return next;
};