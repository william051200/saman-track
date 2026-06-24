# saman-track

An installable Progressive Web App (PWA) to track parking-fine decisions. You never
pay the **RM9/day** parking fee and are only sometimes fined **RM10** — this app records
each day, shows how much you've saved vs. fined, and reveals when enforcement usually
happens. Records sync to a Google Sheet with full offline support.

> "Saman" is the Malay word for a fine/ticket.

## Features

- **Add records**: date, "were you fined?" toggle, and fine time (when fined).
- **Dashboard — three headline numbers (MYR / RM):**
  1. **Net savings** = `RM9 × days − RM10 × fines`
  2. **Total saved (before fines)** = `RM9 × days`
  3. **Total fined** = `RM10 × fines`
- **Fine-time analysis**: hourly histogram + peak window + average fine time.
- **History**: list, edit, delete records.
- **Google Sheets storage** with an **offline-first** local cache (works without internet, syncs when back online).
- **Installable** on iOS, Android, and desktop (PWA / Add to Home Screen).

## Tech stack

Vite · React · TypeScript · `vite-plugin-pwa` · Chart.js · Google Sheets API + Google Identity Services.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Google Sheets setup (one time)

1. Create a Google Sheet and copy its **Spreadsheet ID** from the URL: `…/d/<THIS>/edit`.
2. Add a tab named **`Records`** (or change the name in the app's Settings).
3. In [Google Cloud Console](https://console.cloud.google.com/):
   - Enable the **Google Sheets API**.
   - Create an **OAuth client ID** (Application type: **Web**).
   - Under **Authorized JavaScript origins**, add your app origins, e.g.
     `http://localhost:5173` and your GitHub Pages URL
     (`https://<user>.github.io`).
4. Enter the **Client ID** and **Spreadsheet ID** in the app's **Settings** tab
   (or set `VITE_GOOGLE_CLIENT_ID` / `VITE_SPREADSHEET_ID` — see `.env.example`).
5. Tap **Sync** to push/pull. First sync may prompt Google sign-in.

The sheet columns are: `id`, `date`, `fined`, `fineTime`, `createdAt`.

## Deploy to GitHub Pages

- The included workflow (`.github/workflows/deploy.yml`) builds with the
  `/saman-track/` base path and publishes to Pages on every push to `main`.
- In the repo: **Settings → Pages → Source: GitHub Actions**.
- (Optional) add repo secrets `VITE_GOOGLE_CLIENT_ID` and `VITE_SPREADSHEET_ID`
  to bake credentials in at build time; otherwise enter them in Settings at runtime.
- Manual alternative: `npm run build:gh && npm run deploy`.

## Installing the app

- **Android / desktop Chrome/Edge**: use the install prompt / address-bar install icon.
- **iOS Safari**: Share → **Add to Home Screen**.

## How storage works

Records are written to `localStorage` immediately, so the app is fully usable offline.
Each new/edited/deleted record is marked *pending*; tapping **Sync** pushes pending
local changes to the sheet (local wins), or pulls the latest sheet contents when there
are no pending changes.
