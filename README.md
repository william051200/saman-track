# saman-track

An installable PWA to track parking-fine decisions. You never pay the **RM9/day**
parking fee and are only sometimes fined **RM10** — this app records each day, shows how
much you've saved vs. fined, and reveals when enforcement usually happens. All data is
stored **locally** in a plain `.txt` file — no cloud, no account.

> "Saman" is the Malay word for a fine/ticket.

## Features

- **Add records**: date, "were you fined?" toggle, and fine time (when fined).
- **Dashboard — three headline numbers (MYR / RM):**
  1. **Net savings** = `RM9 × days − RM10 × fines`
  2. **Total saved (before fines)** = `RM9 × days`
  3. **Total fined** = `RM10 × fines`
- **Fine-time analysis**: hourly histogram + peak window + average fine time.
- **Peak-window savings**: estimates how much you save by paying for parking
  (**RM1.2/hr** by default) only during the busiest enforcement window, comparing it
  side by side against never paying and against paying the full enforcement span.
- **History**: list, edit, delete records.
- **Local `.txt` storage**, offline-first.
- **Configurable** parking rate and peak-window length (in the Data/Settings tab).
- **Installable** on iOS, Android, and desktop.

## Tech stack

Vite · React · TypeScript · `vite-plugin-pwa` · Chart.js.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Documentation

- [Storage — local `.txt` file](docs/STORAGE.md)
- [Deploy to Vercel](docs/DEPLOY.md)
- [Installing the app](docs/INSTALL.md)
