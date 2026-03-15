export type Page = "home" | "history" | "settings";
export type Language = "uk" | "en";
export type ThemeMode = "light" | "dark" | "system" | "custom";
export type Status = "worked" | "vacation" | "day_off" | "sick_leave" | "custom";
export type FlashType = "success" | "error";

export interface ActiveSession {
  active: boolean;
  session_id: number | null;
  start_time: string | null;
  elapsed_seconds: number;
}

export interface Entry {
  id: number;
  day: string;
  display_date: string;
  hours: string;
  total_seconds: number;
  status: Status;
  note: string;
}

export interface Preferences {
  language: Language;
  theme_mode: ThemeMode;
  primary_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
}

export type ColorPreferenceKey =
  | "primary_color"
  | "background_color"
  | "surface_color"
  | "text_color";

export interface EntriesResponse {
  items: Entry[];
  summary_seconds: number;
  summary_label: string;
}

export interface UpdateEntryPayload {
  override_seconds: number;
  is_override: boolean;
  status: Status;
  note: string;
}

export interface FlashMessage {
  type: FlashType;
  text: string;
}
