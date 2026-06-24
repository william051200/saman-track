# Deploy to Vercel

This app is a static Vite SPA. The repo is already Vercel-ready: `vercel.json` sets the
Vite framework preset and SPA rewrites, so no extra configuration is needed. Storage is
local, so there are **no environment variables** to set.

## Option A — Git integration (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New… → Project**, then **Import** `william051200/saman-track`
   (authorize Vercel to access the repo if prompted).
3. Vercel auto-detects the settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   Leave the defaults and click **Deploy**.
4. You'll get a `https://<project>.vercel.app` URL. Every push to `main`
   redeploys automatically.

## Option B — Vercel CLI

```bash
npm i -g vercel
vercel login   # one-time browser sign-in
vercel         # first run links/creates the project
vercel --prod  # production deploy
```

## Notes

- HTTPS is provided automatically by Vercel — required for the PWA to be installable.
- To use a custom domain: Vercel project → **Settings → Domains**.
