# Deploy to Vercel

This app is a static Vite SPA. The repo is already Vercel-ready: `vercel.json` sets the
Vite framework preset and SPA rewrites, so no extra configuration is needed. Storage is
local, so there are **no environment variables** to set.

The project is already deployed at **https://saman-track.vercel.app**.

## Manual deploy with the Vercel CLI

The project is already linked locally (a `.vercel/` folder, git-ignored), so from the
repo root you just run:

```bash
vercel --prod          # build on Vercel and promote to production
vercel                 # deploy a preview build (non-production URL)
```

`vercel login` (one-time, opens a browser) authenticates the CLI. In a non-interactive
environment, use an access token instead — create one at
<https://vercel.com/account/tokens>, then:

```bash
# pass it per command…
vercel --prod --token YOUR_TOKEN --yes

# …or set it once for the shell session
export VERCEL_TOKEN=YOUR_TOKEN   # PowerShell: $env:VERCEL_TOKEN="YOUR_TOKEN"
vercel --prod --yes
```

> Treat the token like a password. Don't commit it; rotate/revoke unused tokens.

Useful extras:

```bash
vercel ls              # list deployments
vercel inspect <url>   # show details/logs for a deployment
vercel rollback <url>  # promote a previous deployment back to production
```

## Connect Git for automatic deploys (recommended)

A CLI deploy is a one-off. To redeploy automatically on every push:

1. Open the project on [vercel.com](https://vercel.com) → **Settings → Git**.
2. **Connect** the GitHub repo `william051200/saman-track`
   (authorize Vercel to access it if prompted).
3. After connecting, every push to `main` triggers a production deploy, and pull
   requests get preview deployments.

Alternatively, create the project fresh from Git: **Add New… → Project → Import**
`william051200/saman-track`. Vercel auto-detects framework **Vite**
(build `npm run build`, output `dist`); click **Deploy**.

## Notes

- HTTPS is provided automatically by Vercel — required for the PWA to be installable.
- To use a custom domain: Vercel project → **Settings → Domains**.
