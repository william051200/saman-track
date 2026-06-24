# saman-track

An installable Progressive Web App (PWA) to track parking-fine decisions. You never
pay the **RM9/day** parking fee and are only sometimes fined **RM10** — this app records
each day, shows how much you've saved vs. fined, and reveals when enforcement usually
happens. All data is stored **locally** in a plain **.txt** file — no cloud, no account.

> "Saman" is the Malay word for a fine/ticket.

## Features

- **Add records**: date, "were you fined?" toggle, and fine time (when fined).
- **Dashboard — three headline numbers (MYR / RM):**
  1. **Net savings** = `RM9 × days − RM10 × fines`
  2. **Total saved (before fines)** = `RM9 × days`
  3. **Total fined** = `RM10 × fines`
- **Fine-time analysis**: hourly histogram + peak window + average fine time.
- **History**: list, edit, delete records.
- **Local .txt storage** (offline-first) — see below.
- **Installable** on iOS, Android, and desktop (PWA / Add to Home Screen).

## Tech stack

Vite · React · TypeScript · `vite-plugin-pwa` · Chart.js.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## How storage works (local .txt file)

Records live in your browser's `localStorage`, so the app is instant and works fully
offline. From the **Data** tab you can persist them to a plain text file:

- **Export .txt** — download a backup of all records (works on every platform).
- **Import .txt** — load records from a `.txt` file.
- **Link file (desktop)** — on Chrome/Edge desktop (File System Access API) you can link
  a `.txt` file once; every change then **auto-saves** to it. On iOS/Android use
  Export/Import instead.

The file is human-readable: a header line plus one record per line, fields separated by
`|`:

```
id|date|fined|fineTime|createdAt
1718-abc|2026-06-24|TRUE|08:30|2026-06-24T08:30:00.000Z
1718-def|2026-06-25|FALSE||2026-06-25T09:00:00.000Z
```

## Deploy to Vercel

This app is a static Vite SPA — Vercel detects it automatically.

**Option A — Git integration (recommended)**
1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com) → **Add New… → Project** → import the repo.
3. Framework preset **Vite** is auto-detected (build `npm run build`, output `dist`).
   The included `vercel.json` adds SPA rewrites. Click **Deploy**.
4. Every push to `main` redeploys automatically.

**Option B — Vercel CLI**
```bash
npm i -g vercel
vercel        # first run links the project
vercel --prod # production deploy
```

## Installing the app

- **Android / desktop Chrome/Edge**: use the install prompt / address-bar install icon.
- **iOS Safari**: Share → **Add to Home Screen**.
