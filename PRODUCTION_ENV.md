# Production env — `asked.fr`

Copy-paste-ready environment variables for deploying **Asked.** to production via **Dokploy + Dockerfile**, configured for the domain `asked.fr`.

> **Security note.** `APP_KEY`, `DB_PASSWORD`, `MAIL_PASSWORD` are secrets — never commit them. Replace the placeholders with real values inside Dokploy's **Environment** UI (not in this file or the repo).

---

## 1. Generate `APP_KEY`

Run locally (does not modify your local `.env`):

```bash
php artisan key:generate --show
```

Paste the resulting `base64:…` string into the `APP_KEY` field in Dokploy.

---

## 2. App & runtime

```env
APP_NAME="Asked."
APP_ENV=production
APP_KEY=base64:REPLACE_WITH_GENERATED_KEY
APP_DEBUG=false
APP_URL=https://asked.fr
APP_LOCALE=en
APP_FALLBACK_LOCALE=en

VITE_APP_NAME="Asked."

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=warning
```

## 3. Reverse proxy + session

Required when the app sits behind Dokploy's Traefik proxy (always the case).

```env
TRUSTED_PROXIES=*

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_DOMAIN=.asked.fr
SESSION_SAME_SITE=lax
```

`SESSION_DOMAIN=.asked.fr` (with the leading dot) lets subdomains share the session. If you only ever use the apex `asked.fr`, drop the leading dot or omit the line.

## 4. Database — pick **one**

### Option A — Postgres managed by Dokploy (recommended)

1. In Dokploy, create a Postgres service.
2. Copy its credentials into:

```env
DB_CONNECTION=pgsql
DB_HOST=REPLACE_WITH_DOKPLOY_HOST
DB_PORT=5432
DB_DATABASE=asked
DB_USERNAME=asked
DB_PASSWORD=REPLACE_WITH_DOKPLOY_PASSWORD
```

### Option B — SQLite + persistent volume

1. In Dokploy, add a volume mounted at `/app/database`.
2. Set:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/app/database/database.sqlite
```

Pros: zero infra. Cons: single instance only, no horizontal scaling.

## 5. Cache & queue

```env
CACHE_STORE=database
QUEUE_CONNECTION=database
BROADCAST_CONNECTION=null
```

## 6. Mail

Until you have an SMTP provider, send-as-log keeps the app working without burning real emails:

```env
MAIL_MAILER=log
MAIL_FROM_ADDRESS="hello@asked.fr"
MAIL_FROM_NAME="Asked."
```

When SMTP is ready (Resend / Postmark / OVH / Mailgun / etc.):

```env
MAIL_MAILER=smtp
MAIL_HOST=REPLACE_WITH_SMTP_HOST
MAIL_PORT=587
MAIL_USERNAME=REPLACE_WITH_SMTP_USER
MAIL_PASSWORD=REPLACE_WITH_SMTP_PASSWORD
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="hello@asked.fr"
MAIL_FROM_NAME="Asked."
```

## 7. Fortify (auth) — optional

Defaults are fine; only set explicitly if you want to be sure.

```env
FORTIFY_GUARD=web
FORTIFY_PASSWORDS=users
```

---

## Dokploy steps

1. **Create app** → connect repo `NQNT-Devellopement/asked`, branch `main`, build provider = **Dockerfile** (auto-detected from the repo root).
2. **Add env vars** above into Dokploy's Environment UI.
3. **Database** → either create the Postgres service (Option A) or add a `/app/database` volume (Option B).
4. **Domain** → map `asked.fr` to the app, enable Let's Encrypt for HTTPS. Container listens on port `8080`.
5. **Deploy.**

On first boot, `docker/entrypoint.sh` runs `php artisan migrate --force` + recaches config / routes / views, then supervisord starts nginx + PHP-FPM + a queue worker.

---

## Smoke checks after deploy

- `https://asked.fr/up` → **200** (Laravel health endpoint)
- `https://asked.fr` → marketing page renders
- `https://asked.fr/register` → registration flow works
- `https://asked.fr/docs` → manual renders

If anything 5xx's at boot, the Laravel error stack-trace is in Dokploy's logs (`LOG_LEVEL=warning` keeps them concise).

---

## See also

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — full deployment reference (variants, troubleshooting, Docker fallback)
- [`README.md`](./README.md) — project overview
- [`Dockerfile`](./Dockerfile) — multi-stage build (composer + node → php-fpm + nginx)
- [`docker-compose.yml`](./docker-compose.yml) — local prod-parity stack with Postgres
