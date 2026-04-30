# Production env — `asked.fr`

Copy-paste-ready environment variables for deploying **Asked.** to production via **Dokploy + Compose**, configured for the domain `asked.fr`. The compose stack includes app + Postgres + Redis — most env vars below are wired automatically; you only need to set the secrets.

> **Security note.** `APP_KEY`, `DB_PASSWORD`, `REDIS_PASSWORD`, `MAIL_PASSWORD` are secrets — never commit them. Replace the placeholders with real values inside Dokploy's **Environment** UI (not in this file or the repo).

---

## 1. Generate `APP_KEY`

Run locally (does not modify your local `.env`):

```bash
php artisan key:generate --show
```

Paste the resulting `base64:…` string into the `APP_KEY` field in Dokploy.

---

## 2. Required secrets — set these in Dokploy

The compose file declares sensible defaults for everything else; these are the only env vars you MUST provide.

```env
# App
APP_KEY=base64:REPLACE_WITH_GENERATED_KEY
APP_URL=https://asked.fr
APP_ENV=production
APP_DEBUG=false

# Database (Postgres in the `db` service)
DB_PASSWORD=REPLACE_WITH_RANDOM_HEX

# Redis (the `redis` service) — optional but recommended
REDIS_PASSWORD=REPLACE_WITH_RANDOM_HEX

# Cookies + proxy
SESSION_SECURE_COOKIE=true
SESSION_DOMAIN=.asked.fr
```

Generate the two passwords:

```bash
openssl rand -hex 32   # for DB_PASSWORD
openssl rand -hex 32   # for REDIS_PASSWORD
```

`SESSION_DOMAIN=.asked.fr` (with the leading dot) lets subdomains share the session. If you only ever use the apex `asked.fr`, drop the leading dot or omit the line.

---

## 3. Mail — set when SMTP is ready

The compose default is `MAIL_MAILER=log` (writes to `storage/logs/laravel.log`, no real emails sent). When you have an SMTP provider (Resend / Postmark / OVH / Mailgun / etc.), override:

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

---

## 4. Optional overrides

The compose file already sets these to good production defaults. Only override if you have a specific reason.

```env
APP_LOCALE=fr               # default `en`
LOG_LEVEL=info              # default `warning`
APP_PORT=8080               # host port mapping (default 8080)
```

The compose stack also wires (no need to set):

- `DB_CONNECTION=pgsql` + `DB_HOST=db` + `DB_PORT=5432` + `DB_DATABASE=asked` + `DB_USERNAME=asked`
- `REDIS_CLIENT=predis` + `REDIS_HOST=redis` + `REDIS_PORT=6379`
- `CACHE_STORE=redis` + `SESSION_DRIVER=redis` + `QUEUE_CONNECTION=redis`
- `TRUSTED_PROXIES=*`
- `VITE_APP_NAME="Asked."`

---

## Dokploy steps (compose flow)

1. **Create Compose app** → connect repo `NQNT-Devellopement/asked`, branch `main`.
2. Dokploy reads `docker-compose.yml` automatically (3 services: `app`, `db`, `redis`).
3. Add the **secrets** from [section 2](#2-required-secrets--set-these-in-dokploy) into Dokploy's Environment UI.
4. **Domain** → map `asked.fr` to the `app` service on port `8080`. Enable Let's Encrypt.
5. **Deploy.**

On first boot, Compose brings up `db` + `redis`, waits for both healthchecks, then starts `app`. The app's entrypoint (`docker/entrypoint.sh`) runs `php artisan migrate --force` + recaches config / routes / views, then supervisord starts nginx + PHP-FPM + queue worker.

---

## Smoke checks after deploy

- `https://asked.fr/up` → **200** (Laravel health endpoint)
- `https://asked.fr` → marketing page renders
- `https://asked.fr/register` → registration flow works
- `https://asked.fr/docs` → manual renders

If anything 5xx's at boot, the Laravel error stack-trace is in Dokploy's logs (`LOG_LEVEL=warning` keeps them concise — bump to `info` or `debug` to dig deeper).

---

## Local prod-parity testing

The same `docker-compose.yml` works for local testing:

```bash
APP_KEY=$(php artisan key:generate --show)
DB_PASSWORD=$(openssl rand -hex 16)
APP_KEY="$APP_KEY" DB_PASSWORD="$DB_PASSWORD" docker compose up --build
open http://localhost:8080
```

`docker compose down -v` clears the Postgres + Redis volumes between runs.

---

## See also

- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — full deployment reference (Dockerfile-only fallback, troubleshooting)
- [`README.md`](./README.md) — project overview
- [`docker-compose.yml`](./docker-compose.yml) — the actual stack definition
- [`Dockerfile`](./Dockerfile) — the app image (multi-stage build)
