import type { Preferences } from "../types";

export const defaultPreferences: Preferences = {
  language: "uk",
  theme_mode: "system",
  primary_color: "#4f46e5",
  background_color: "#0f172a",
  surface_color: "#111827",
  text_color: "#f8fafc",
};

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

export function normalizeHexColor(value: string, fallback: string) {
  const normalized = value.trim();
  if (!HEX_COLOR_RE.test(normalized)) {
    return fallback;
  }
  return normalized.toLowerCase();
}

export function sanitizePreferences(preferences: Preferences): Preferences {
  return {
    ...preferences,
    primary_color: normalizeHexColor(preferences.primary_color, defaultPreferences.primary_color),
    background_color: normalizeHexColor(
      preferences.background_color,
      defaultPreferences.background_color
    ),
    surface_color: normalizeHexColor(preferences.surface_color, defaultPreferences.surface_color),
    text_color: normalizeHexColor(preferences.text_color, defaultPreferences.text_color),
  };
}

export function applyTheme(preferences: Preferences) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = preferences.theme_mode === "dark" || (preferences.theme_mode === "system" && prefersDark);

  const palette =
    preferences.theme_mode === "custom"
      ? {
          bg: normalizeHexColor(preferences.background_color, defaultPreferences.background_color),
          surface: normalizeHexColor(preferences.surface_color, defaultPreferences.surface_color),
          text: normalizeHexColor(preferences.text_color, defaultPreferences.text_color),
          primary: normalizeHexColor(preferences.primary_color, defaultPreferences.primary_color),
        }
      : isDark
        ? {
            bg: "#0b1220",
            surface: "#111827",
            text: "#f8fafc",
            primary: "#6366f1",
          }
        : {
            bg: "#eef2ff",
            surface: "#ffffff",
            text: "#0f172a",
            primary: "#4f46e5",
          };

  root.style.setProperty("--bg", palette.bg);
  root.style.setProperty("--surface", palette.surface);
  root.style.setProperty("--text", palette.text);
  root.style.setProperty("--primary", palette.primary);
}
