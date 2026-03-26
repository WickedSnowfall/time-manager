import type {
  ActiveSession,
  AuthResponse,
  EntriesResponse,
  Entry,
  LoginPayload,
  Preferences,
  RegisterPayload,
  UpdateEntryPayload,
  User,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "time-manager-token";

export function getAccessToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options?.headers ?? {});
  if (!headers.has("Content-Type") && options?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    let message = "Request failed";

    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as { detail?: string };
      message = payload.detail ?? message;
    } else {
      const text = (await response.text()).trim();
      message = text || message;
    }

    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: async (payload: RegisterPayload) => {
    const result = await request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setAccessToken(result.access_token);
    return result;
  },
  login: async (payload: LoginPayload) => {
    const result = await request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setAccessToken(result.access_token);
    return result;
  },
  me: () => request<User>("/api/auth/me"),
  loadActive: () => request<ActiveSession>("/api/sessions/active"),
  loadEntries: (months: number) => request<EntriesResponse>(`/api/entries?months=${months}`),
  loadPreferences: () => request<Preferences>("/api/preferences"),
  startSession: () => request("/api/sessions/start", { method: "POST" }),
  stopSession: () => request("/api/sessions/stop", { method: "POST" }),
  saveEntry: (entryId: number, payload: UpdateEntryPayload) =>
    request<Entry>(`/api/entries/${entryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  savePreferences: (payload: Preferences) =>
    request<Preferences>("/api/preferences", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
