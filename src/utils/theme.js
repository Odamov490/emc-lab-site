// src/utils/theme.js
export function initTheme() {
  try {
    const saved = localStorage.getItem("theme_dark");
    const prefers = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const dark = saved === null ? !!prefers : saved === "1";
    applyTheme(dark);
    return dark;
  } catch {
    applyTheme(false);
    return false;
  }
}

export function applyTheme(dark) {
  const html = document.documentElement;
  html.classList.toggle("dark", !!dark);
  try {
    localStorage.setItem("theme_dark", dark ? "1" : "0");
  } catch {}
}
