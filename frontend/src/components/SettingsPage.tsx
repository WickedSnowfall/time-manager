import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { ColorPreferenceKey, Language, Preferences, ThemeMode } from "../types";
import type { Messages } from "../i18n";
import { defaultPreferences, normalizeHexColor } from "../lib/theme";

interface SettingsPageProps {
  preferences: Preferences;
  setPreferences: Dispatch<SetStateAction<Preferences>>;
  onSave: (next: Preferences) => Promise<void>;
  onBack: () => void;
  t: Messages;
}

export function SettingsPage({
  preferences,
  setPreferences,
  onSave,
  onBack,
  t,
}: SettingsPageProps) {
  const [saving, setSaving] = useState(false);
  const colorFields: Array<{ key: ColorPreferenceKey; label: string }> = useMemo(
    () => [
      { key: "primary_color", label: t.primary },
      { key: "background_color", label: t.background },
      { key: "surface_color", label: t.surface },
      { key: "text_color", label: t.text },
    ],
    [t.background, t.primary, t.surface, t.text],
  );

  function updateColorPreference(key: ColorPreferenceKey, value: string) {
    setPreferences((prev) => ({
      ...prev,
      theme_mode: "custom",
      [key]: normalizeHexColor(value, prev[key]),
    }));
  }

  function updateColorText(key: ColorPreferenceKey, value: string) {
    setPreferences((prev) => ({
      ...prev,
      theme_mode: "custom",
      [key]: value,
    }));
  }

  async function submit() {
    setSaving(true);
    try {
      await onSave(preferences);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card settings-card">
      <div className="settings-header">
        <button className="secondary-button" onClick={onBack}>
          ←
        </button>
        <h2>{t.settings}</h2>
      </div>

      <label>
        {t.language}
        <select
          value={preferences.language}
          onChange={(e) =>
            setPreferences((prev) => ({ ...prev, language: e.target.value as Language }))
          }
        >
          <option value="uk">Українська</option>
          <option value="en">English</option>
        </select>
      </label>

      <label>
        {t.theme}
        <select
          value={preferences.theme_mode}
          onChange={(e) =>
            setPreferences((prev) => ({ ...prev, theme_mode: e.target.value as ThemeMode }))
          }
        >
          <option value="light">{t.light}</option>
          <option value="dark">{t.dark}</option>
          <option value="system">{t.system}</option>
          <option value="custom">{t.custom}</option>
        </select>
      </label>

      {colorFields.map(({ key, label }) => {
        const safeColor = normalizeHexColor(preferences[key], defaultPreferences[key]);
        return (
          <label key={key}>
            {label}
            <div className="color-input-row">
              <input
                type="color"
                value={safeColor}
                onChange={(e) => updateColorPreference(key, e.target.value)}
                aria-label={label}
              />
              <input
                type="text"
                value={preferences[key]}
                onChange={(e) => updateColorText(key, e.target.value)}
                onBlur={(e) => updateColorPreference(key, e.target.value)}
                placeholder="#112233"
                className="hex-input"
              />
            </div>
          </label>
        );
      })}

      <p className="field-hint">{t.customThemeHint}</p>

      <button className="primary-button" onClick={submit} disabled={saving}>
        {t.save}
      </button>
    </section>
  );
}
