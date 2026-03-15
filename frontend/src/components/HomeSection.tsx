import { formatDuration } from "../lib/time";
import type { Messages } from "../i18n";
import type { ActiveSession } from "../types";

interface HomeSectionProps {
  activeSession: ActiveSession;
  busy: boolean;
  todayHours: string;
  onToggleSession: () => Promise<void>;
  t: Pick<Messages, "active" | "noActive" | "start" | "stop" | "workedToday">;
}

export function HomeSection({
  activeSession,
  busy,
  todayHours,
  onToggleSession,
  t,
}: HomeSectionProps) {
  return (
    <section className="card hero-card">
      <div className="timer">{formatDuration(activeSession.elapsed_seconds)}</div>

      <button className="primary-button" onClick={() => void onToggleSession()} disabled={busy}>
        {activeSession.active ? t.stop : t.start}
      </button>

      <div className="info-grid">
        <div className="info-card">
          <span>{t.active}</span>
          <strong>
            {activeSession.active ? formatDuration(activeSession.elapsed_seconds) : t.noActive}
          </strong>
        </div>

        <div className="info-card">
          <span>{t.workedToday}</span>
          <strong>{todayHours}</strong>
        </div>
      </div>
    </section>
  );
}
