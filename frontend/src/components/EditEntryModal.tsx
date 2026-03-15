import type { Dispatch, SetStateAction } from "react";

import { statusLabel } from "../i18n";
import type { Messages } from "../i18n";
import type { Entry, Language, Status } from "../types";

interface EditEntryModalProps {
  editing: Entry | null;
  language: Language;
  editHours: string;
  setEditHours: Dispatch<SetStateAction<string>>;
  editStatus: Status;
  setEditStatus: Dispatch<SetStateAction<Status>>;
  editNote: string;
  setEditNote: Dispatch<SetStateAction<string>>;
  onClose: () => void;
  onSave: () => Promise<void>;
  t: Pick<Messages, "editDay" | "hours" | "status" | "note" | "cancel" | "save">;
}

export function EditEntryModal({
  editing,
  language,
  editHours,
  setEditHours,
  editStatus,
  setEditStatus,
  editNote,
  setEditNote,
  onClose,
  onSave,
  t,
}: EditEntryModalProps) {
  if (!editing) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{t.editDay}</h3>

        <label>
          {t.hours}
          <input
            type="time"
            step={60}
            value={editHours}
            onChange={(e) => setEditHours(e.target.value)}
          />
        </label>

        <label>
          {t.status}
          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Status)}>
            <option value="worked">{statusLabel(language, "worked")}</option>
            <option value="vacation">{statusLabel(language, "vacation")}</option>
            <option value="day_off">{statusLabel(language, "day_off")}</option>
            <option value="sick_leave">{statusLabel(language, "sick_leave")}</option>
            <option value="custom">{statusLabel(language, "custom")}</option>
          </select>
        </label>

        <label>
          {t.note}
          <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} />
        </label>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="primary-button" onClick={() => void onSave()}>
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
