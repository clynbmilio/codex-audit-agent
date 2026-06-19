# README Security Quick Audit

Minimal Netlify deploy package for the x402 README/security audit endpoint.

Wallet:

`0xEbf30aEe899729b64aA3436D6b1dd45D063D1A12`

## What This Deploys

- `/` public landing page.
- `/health` health check.
- `/.well-known/agent-card.json` agent metadata.
- `/openapi.json` OpenAPI metadata.
- `/audit` paid endpoint shape that returns HTTP `402` with `PAYMENT-REQUIRED`.

The agent-card and OpenAPI routes are served by Netlify Functions so they do not depend on GitHub uploading hidden `.well-known` folders correctly.

## Netlify Settings

When importing this repository into Netlify:

- Build command: leave blank.
- Publish directory: `public`.
- Functions directory: `netlify/functions`.

## Test After Deploy

Replace `YOUR_SITE`:

```powershell
Invoke-RestMethod https://YOUR_SITE.netlify.app/health
```

Expected wallet:

`0xEbf30aEe899729b64aA3436D6b1dd45D063D1A12`

Unpaid `/audit` should return HTTP `402`.

## After Agent Card Works

Run `NEXT.cmd` for live testing and discovery registration.
