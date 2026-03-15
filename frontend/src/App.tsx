import { useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";

import { api } from "./api";
import { EditEntryModal } from "./components/EditEntryModal";
import { HistorySection } from "./components/HistorySection";
import { HomeSection } from "./components/HomeSection";
import { SettingsPage } from "./components/SettingsPage";
import { dictionary } from "./i18n";
import { applyTheme, defaultPreferences, sanitizePreferences } from "./lib/theme";
import { formatDisplayHHMM, formatDuration, localDateISO, parseHHMMToSeconds } from "./lib/time";
import type { ActiveSession, Entry, FlashMessage, Page, Preferences, Status } from "./types";

function asErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
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
  const [message, setMessage] = useState<FlashMessage | null>(null);
  const touchStartX = useRef<number | null>(null);

  const language = preferences.language;
  const t = dictionary[language];

  function showMessage(next: FlashMessage) {
    setMessage(next);
  }

  function clearMessage() {
    setMessage(null);
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
    const boot = async () => {
      try {
        await Promise.all([loadActive(), loadEntries(filterMonths), loadPreferences()]);
      } catch (error) {
        showMessage({ type: "error", text: asErrorMessage(error, t.requestFailed) });
      }
    };

    void boot();
  }, []);

  useEffect(() => {
    const syncEntries = async () => {
      try {
        await loadEntries(filterMonths);
      } catch (error) {
        showMessage({ type: "error", text: asErrorMessage(error, t.requestFailed) });
      }
    };

    void syncEntries();
  }, [filterMonths]);

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
    if (!message) return;

    const timeout = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const today = localDateISO();
  const todayEntry = useMemo(() => entries.find((i) => i.day === today), [entries, today]);
  const liveTodayHours = useMemo(() => {
    const activeTodaySeconds = activeSession.active && activeSession.start_time?.slice(0, 10) === today
      ? activeSession.elapsed_seconds
      : 0;
    const totalSeconds = (todayEntry?.total_seconds ?? 0) + activeTodaySeconds;
    return formatDisplayHHMM(totalSeconds);
  }, [activeSession.active, activeSession.elapsed_seconds, activeSession.start_time, today, todayEntry?.total_seconds]);

  async function toggleSession() {
    if (busy) return;

    setBusy(true);
    clearMessage();
    try {
      if (activeSession.active) {
        await api.stopSession();
        showMessage({ type: "success", text: t.sessionStopped });
      } else {
        await api.startSession();
        showMessage({ type: "success", text: t.sessionStarted });
      }

      await Promise.all([loadActive(), loadEntries(filterMonths)]);
    } catch (error) {
      showMessage({ type: "error", text: asErrorMessage(error, t.requestFailed) });
    } finally {
      setBusy(false);
    }
  }

  function openEdit(entry: Entry) {
    setEditing(entry);
    setEditHours(entry.hours);
    setEditStatus(entry.status);
    setEditNote(entry.note);
    clearMessage();
  }

  async function saveEdit() {
    if (!editing) return;

    const overrideSeconds = parseHHMMToSeconds(editHours);
    if (overrideSeconds === null) {
      showMessage({ type: "error", text: t.invalidTime });
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
      showMessage({ type: "success", text: t.entrySaved });
    } catch (error) {
      showMessage({ type: "error", text: asErrorMessage(error, t.requestFailed) });
    }
  }

  async function savePreferences(next: Preferences) {
    const payload = sanitizePreferences(next);
    try {
      const saved = sanitizePreferences(await api.savePreferences(payload));
      setPreferences(saved);
      showMessage({ type: "success", text: t.settingsSaved });
    } catch (error) {
      showMessage({ type: "error", text: asErrorMessage(error, t.requestFailed) });
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

  return (
    <main className="app-shell" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="app-container">
        <header className="topbar">
          <h1>{t.title}</h1>
          <button className="icon-button" onClick={() => setPage("settings")} aria-label={t.settings}>
            ⚙
          </button>
        </header>

        {message && (
          <div className={`flash-message ${message.type}`} role="status">
            <span>{message.text}</span>
            <button className="flash-close" onClick={clearMessage} aria-label={t.closeMessage}>
              ×
            </button>
          </div>
        )}

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
            todayHours={liveTodayHours}
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
