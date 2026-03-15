import type {
  ActiveSession,
  EntriesResponse,
  Entry,
  Preferences,
  UpdateEntryPayload,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as { detail?: string };
      throw new Error(payload.detail ?? "Request failed");
    }

    const text = (await response.text()).trim();
    throw new Error(text || "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
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
