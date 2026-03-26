export type Page = "home" | "history" | "settings";
export type Language = "uk" | "en";
export type ThemeMode = "light" | "dark" | "system" | "custom";
export type Status = "worked" | "vacation" | "day_off" | "sick_leave" | "custom";
export type AuthMode = "login" | "register";

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

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
  summary_label: string;
}

export interface UpdateEntryPayload {
  override_seconds: number;
  is_override: boolean;
  status: Status;
  note: string;
}
