# Storage — local `.txt` file

Records live in your browser's `localStorage`, so the app is instant and works fully
offline. From the **Data** tab you can persist them to a plain text file:

- **Export .txt** — download a backup of all records (works on every platform).
- **Import .txt** — load records from a `.txt` file.
- **Link file (desktop)** — on Chrome/Edge desktop (File System Access API) you can link
  a `.txt` file once; every change then **auto-saves** to it. On iOS/Android use
  Export/Import instead.

## File format

The file is human-readable: a header line plus one record per line, fields separated by
`|`:

```
id|date|fined|fineTime|createdAt
1718-abc|2026-06-24|TRUE|08:30|2026-06-24T08:30:00.000Z
1718-def|2026-06-25|FALSE||2026-06-25T09:00:00.000Z
```

| Field       | Meaning                                  |
|-------------|------------------------------------------|
| `id`        | stable, client-generated record id       |
| `date`      | parking day (`YYYY-MM-DD`)               |
| `fined`     | `TRUE` / `FALSE`                         |
| `fineTime`  | `HH:mm` (empty when not fined)           |
| `createdAt` | ISO timestamp when the record was added  |
