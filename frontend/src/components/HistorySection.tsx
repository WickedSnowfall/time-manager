import { statusLabel } from "../i18n";
import type { Messages } from "../i18n";
import type { Entry, Language } from "../types";

const MONTH_FILTERS = [1, 3, 6] as const;

interface HistorySectionProps {
  entries: Entry[];
  filterMonths: number;
  onFilterChange: (months: number) => void;
  onOpenEdit: (entry: Entry) => void;
  language: Language;
  summaryLabel: string;
  t: Pick<
    Messages,
    "date" | "filter" | "hours" | "months1" | "months3" | "months6" | "noEntries" | "note" | "status" | "total"
  >;
}

export function HistorySection({
  entries,
  filterMonths,
  onFilterChange,
  onOpenEdit,
  language,
  summaryLabel,
  t,
}: HistorySectionProps) {
  return (
    <section className="card">
      <div className="toolbar">
        <div className="filter-group">
          <span>{t.filter}</span>
          {MONTH_FILTERS.map((months) => (
            <button
              key={months}
              className={filterMonths === months ? "filter active" : "filter"}
              onClick={() => onFilterChange(months)}
            >
              {months === 1 ? t.months1 : months === 3 ? t.months3 : t.months6}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">{t.noEntries}</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t.date}</th>
                <th>{t.hours}</th>
                <th>{t.status}</th>
                <th>{t.note}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} onClick={() => onOpenEdit(entry)}>
                  <td>{entry.display_date}</td>
                  <td>{entry.hours}</td>
                  <td>{statusLabel(language, entry.status)}</td>
                  <td>{entry.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="summary-card">
        <span>{t.total}</span>
        <strong>{summaryLabel}</strong>
      </div>
    </section>
  );
}
