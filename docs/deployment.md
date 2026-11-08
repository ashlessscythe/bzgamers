# Deployment

## Build & start

```bash
npm ci
npm run build   # runs `prisma generate` then `next build` (does NOT migrate)
npm start       # scripts/start.js: `prisma migrate deploy`, then `next start`
```

`npm start` applies pending migrations on boot (skipped when `DATABASE_URL`
looks like a placeholder). Hosts that don't use `npm start` (e.g. serverless
platforms) must run `npx prisma migrate deploy` themselves as a release step.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon/PostgreSQL connection string (`sslmode=require`) |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | yes in production | Public origin, e.g. `https://bzgamers.com`. Building password-reset links fails hard if unset |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL for share links / Open Graph |
| `NEXT_API_CLIENT_ID`, `NEXT_API_CLIENT_SECRET` | yes | Twitch/IGDB credentials |
| `NEXT_TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | yes | Captcha for signup / waitlist / forgot-password |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | yes | Transactional email |
| `ADMIN_ALERT_EMAIL` | optional | Receives (max hourly) Twitch/IGDB token failure alerts |
| `PWNED_PASSWORD_CHECK` | optional | Set to `off` to disable the HaveIBeenPwned breach check at signup/reset |

## Auth host trust

`src/lib/auth-config.js` sets `trustHost: true` so Auth.js accepts the
`Host`/`X-Forwarded-Host` headers from a reverse proxy. This is intentional:
deploy only behind a proxy/platform (Vercel, Cloudflare, nginx) that sets
those headers itself, and always set `NEXTAUTH_URL` in production.

## Checklist

- [ ] Production database created and `DATABASE_URL` set
- [ ] All required env vars above set; no `change-me` placeholders left
- [ ] Migrations applied (`npm start` or `npx prisma migrate deploy`)
- [ ] Domain pointed at the host, HTTPS enabled (HSTS header is sent by the app)
- [ ] Turnstile site domain list includes the production domain
- [ ] Resend sending domain verified
- [ ] Admin user promoted (see `docs/setup-auth.md`)
