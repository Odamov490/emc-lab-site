// src/utils/theme.js

// Temani qo'llash (dark / light)
export function applyTheme(isDark) {
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Boshlang'ich rejimni aniqlash (localStorage yoki OS)
export function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.classList.toggle('dark', saved === 'dark');
    return saved === 'dark';
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
    return prefersDark;
  }
}
