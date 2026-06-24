import { useState } from 'react';
import { ParkingRecord } from '../types';
import { newId } from '../lib/storage';

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function nowHHmm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

interface Props {
  onSave: (rec: ParkingRecord) => void;
  /** When provided, the form edits an existing record. */
  initial?: ParkingRecord;
}

export default function AddRecord({ onSave, initial }: Props) {
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [fined, setFined] = useState(initial?.fined ?? false);
  const [fineTime, setFineTime] = useState(initial?.fineTime || nowHHmm());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rec: ParkingRecord = {
      id: initial?.id ?? newId(),
      date,
      fined,
      fineTime: fined ? fineTime : '',
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSave(rec);
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Edit record' : 'Add record'}</h2>

      <label>
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>

      <label className="toggle">
        <span>Were you fined for not paying?</span>
        <input type="checkbox" checked={fined} onChange={(e) => setFined(e.target.checked)} />
      </label>

      {fined && (
        <label>
          Fine time
          <input
            type="time"
            value={fineTime}
            onChange={(e) => setFineTime(e.target.value)}
            required
          />
        </label>
      )}

      <button type="submit" className="primary">
        {initial ? 'Update' : 'Save'}
      </button>
    </form>
  );
}
