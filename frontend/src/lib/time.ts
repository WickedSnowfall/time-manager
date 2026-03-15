export function formatDuration(total: number) {
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function formatDisplayHHMM(total: number) {
  const displayTotal = total <= 0 ? 0 : Math.max(total, 60);
  const h = String(Math.floor(displayTotal / 3600)).padStart(2, "0");
  const m = String(Math.floor((displayTotal % 3600) / 60)).padStart(2, "0");
  return `${h}:${m}`;
}

const HHMM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseHHMMToSeconds(value: string): number | null {
  const match = HHMM_RE.exec((value || "").trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 3600 + minutes * 60;
}

export function localDateISO() {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}
