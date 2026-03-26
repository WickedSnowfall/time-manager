import { useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";

import { api, clearAccessToken, getAccessToken } from "./api";
import { AuthPage } from "./components/AuthPage";
import { EditEntryModal } from "./components/EditEntryModal";
import { HistorySection } from "./components/HistorySection";
import { HomeSection } from "./components/HomeSection";
import { SettingsPage } from "./components/SettingsPage";
import { dictionary } from "./i18n";
import { applyTheme, defaultPreferences, sanitizePreferences } from "./lib/theme";
import { localDateISO, parseHHMMToSeconds } from "./lib/time";
import type {
  ActiveSession,
  AuthMode,
  Entry,
  Page,
  Preferences,
  Status,
  User,
} from "./types";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeSession, setActiveSession] = useState<ActiveSession>({
    active: false,
    session_id: null,
    start_time: null,
    elapsed_seconds: 0,
  });
  const [entries, setEntries] = useState<Entry[]>([]);
  const [summaryLabel, setSummaryLabel] = useState("0 h 00 m");
  const [filterMonths, setFilterMonths] = useState(1);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [editHours, setEditHours] = useState("08:00");
  const [editStatus, setEditStatus] = useState<Status>("worked");
  const [editNote, setEditNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  const language = preferences.language;
  const t = dictionary[language];

  async function bootstrapAuthenticatedApp() {
    await Promise.all([loadActive(), loadEntries(filterMonths), loadPreferences()]);
  }

  async function loadActive() {
    setActiveSession(await api.loadActive());
  }

  async function loadEntries(months = filterMonths) {
    const data = await api.loadEntries(months);
    setEntries(data.items);
    setSummaryLabel(data.summary_label);
  }

  async function loadPreferences() {
    setPreferences(sanitizePreferences(await api.loadPreferences()));
  }

  useEffect(() => {
    applyTheme(preferences);
  }, [preferences]);

  useEffect(() => {
    if (preferences.theme_mode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncWithSystemTheme = () => applyTheme(preferences);
    media.addEventListener("change", syncWithSystemTheme);
    return () => media.removeEventListener("change", syncWithSystemTheme);
  }, [preferences]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const token = getAccessToken();
      if (!token) {
        if (!cancelled) setBooting(false);
        return;
      }

      try {
        const user = await api.me();
        if (cancelled) return;
        setAuthUser(user);
        await bootstrapAuthenticatedApp();
      } catch {
        clearAccessToken();
        if (!cancelled) setAuthUser(null);
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authUser) return;
    void loadEntries(filterMonths);
  }, [filterMonths, authUser]);

  useEffect(() => {
    if (!activeSession.active) return;

    const timer = setInterval(() => {
      setActiveSession((prev) => ({
        ...prev,
        elapsed_seconds: prev.elapsed_seconds + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession.active]);

  const today = localDateISO();
  const todayEntry = useMemo(() => entries.find((i) => i.day === today), [entries, today]);

  async function handleLogin(payload: { identifier: string; password: string }) {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const response = await api.login(payload);
      setAuthUser(response.user);
      await bootstrapAuthenticatedApp();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setAuthBusy(false);
      setBooting(false);
    }
  }

  async function handleRegister(payload: { username: string; email: string; password: string }) {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const response = await api.register(payload);
      setAuthUser(response.user);
      await bootstrapAuthenticatedApp();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setAuthBusy(false);
      setBooting(false);
    }
  }

  function handleLogout() {
    clearAccessToken();
    setAuthUser(null);
    setEntries([]);
    setSummaryLabel("0 h 00 m");
    setActiveSession({ active: false, session_id: null, start_time: null, elapsed_seconds: 0 });
    setPreferences(defaultPreferences);
    setPage("home");
  }

  async function toggleSession() {
    if (busy) return;

    setBusy(true);
    setRequestError(null);
    try {
      if (activeSession.active) {
        await api.stopSession();
      } else {
        await api.startSession();
      }

      await Promise.all([loadActive(), loadEntries(filterMonths)]);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  function openEdit(entry: Entry) {
    setEditing(entry);
    setEditHours(entry.hours);
    setEditStatus(entry.status);
    setEditNote(entry.note);
  }

  async function saveEdit() {
    if (!editing) return;

    const overrideSeconds = parseHHMMToSeconds(editHours);
    if (overrideSeconds === null) {
      setRequestError("Invalid time format");
      return;
    }

    try {
      await api.saveEntry(editing.id, {
        override_seconds: overrideSeconds,
        is_override: true,
        status: editStatus,
        note: editNote,
      });

      setEditing(null);
      await loadEntries(filterMonths);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Save failed");
    }
  }

  async function savePreferences(next: Preferences) {
    setRequestError(null);
    try {
      const payload = sanitizePreferences(next);
      setPreferences(sanitizePreferences(await api.savePreferences(payload)));
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Settings save failed");
    }
  }

  function onTouchStart(e: TouchEvent) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: TouchEvent) {
    const start = touchStartX.current;
    const end = e.changedTouches[0]?.clientX ?? null;

    if (start === null || end === null || page === "settings") return;

    const delta = end - start;
    if (Math.abs(delta) < 60) return;

    if (delta < 0) setPage("history");
    if (delta > 0) setPage("home");
  }

  if (booting) {
    return (
      <main className="app-shell auth-shell">
        <div className="auth-card card centered-message">{t.loading}</div>
      </main>
    );
  }

  if (!authUser) {
    return (
      <AuthPage
        mode={authMode}
        onModeChange={setAuthMode}
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={authBusy}
        error={authError}
        t={t}
      />
    );
  }

  return (
    <main className="app-shell" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="app-container">
        <header className="topbar">
          <div>
            <h1>{t.title}</h1>
            <div className="user-badge">{t.hello}, {authUser.username}</div>
          </div>
          <button className="icon-button" onClick={() => setPage("settings")} aria-label={t.settings}>
            ⚙
          </button>
        </header>

        {requestError && <div className="banner-error">{requestError}</div>}

        {page !== "settings" && (
          <nav className="tabs">
            <button className={page === "home" ? "tab active" : "tab"} onClick={() => setPage("home")}>
              {t.home}
            </button>
            <button className={page === "history" ? "tab active" : "tab"} onClick={() => setPage("history")}>
              {t.history}
            </button>
          </nav>
        )}

        {page === "home" && (
          <HomeSection
            activeSession={activeSession}
            busy={busy}
            todayHours={todayEntry ? todayEntry.hours : "00:00"}
            onToggleSession={toggleSession}
            t={t}
          />
        )}

        {page === "history" && (
          <HistorySection
            entries={entries}
            filterMonths={filterMonths}
            onFilterChange={setFilterMonths}
            onOpenEdit={openEdit}
            language={language}
            summaryLabel={summaryLabel}
            t={t}
          />
        )}

        {page === "settings" && (
          <SettingsPage
            preferences={preferences}
            setPreferences={setPreferences}
            onSave={savePreferences}
            onBack={() => setPage("home")}
            onLogout={handleLogout}
            t={t}
          />
        )}

        <EditEntryModal
          editing={editing}
          language={language}
          editHours={editHours}
          setEditHours={setEditHours}
          editStatus={editStatus}
          setEditStatus={setEditStatus}
          editNote={editNote}
          setEditNote={setEditNote}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          t={t}
        />
      </div>
    </main>
  );
}
