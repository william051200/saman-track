import { useState } from 'react';
import { ParkingRecord } from '../types';
import { activeRecords } from '../lib/calc';
import AddRecord from './AddRecord';

interface Props {
  records: ParkingRecord[];
  onEdit: (rec: ParkingRecord) => void;
  onDelete: (id: string) => void;
}

export default function History({ records, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState<ParkingRecord | null>(null);

  const rows = activeRecords(records).sort((a, b) => b.date.localeCompare(a.date));

  if (editing) {
    return (
      <div>
        <button className="link" onClick={() => setEditing(null)}>
          ← Back
        </button>
        <AddRecord
          initial={editing}
          onSave={(rec) => {
            onEdit(rec);
            setEditing(null);
          }}
        />
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="muted center">No records yet. Add your first parking day.</p>;
  }

  return (
    <ul className="history">
      {rows.map((r) => (
        <li key={r.id} className="card row">
          <div className="row-main">
            <span className="row-date">{r.date}</span>
            {r.fined ? (
              <span className="badge fined">Fined · {r.fineTime}</span>
            ) : (
              <span className="badge safe">No fine</span>
            )}
          </div>
          <div className="row-actions">
            <button className="link" onClick={() => setEditing(r)}>
              Edit
            </button>
            <button className="link danger" onClick={() => onDelete(r.id)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
