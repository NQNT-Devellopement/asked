# Deployment

Asked. ships as a standard Laravel 13 + Inertia v3 + React 19 app. Production deploys are container-based: the repo includes a multi-stage `Dockerfile` that builds the Vite bundle + Composer artifacts, then runs nginx + PHP-FPM 8.4 + a queue worker via supervisord. Recommended host is **[Dokploy](https://docs.dokploy.com/)**, but anything that runs a Dockerfile works.

---

## Quick start (Dokploy + Dockerfile)

1. **Create the app** — In Dokploy: *Create Application* → connect this GitHub repository → pick the deployment branch (`main`).
2. **Build provider** — Choose **Dockerfile** (Dokploy auto-detects the `Dockerfile` at the repo root).
3. **Environment variables** — Paste the values from [Required environment variables](#required-environment-variables) below. `PRODUCTION_ENV.md` has a copy-paste-ready block tuned for `asked.fr`.
4. **Persistence** — Either:
   - mount a Dokploy persistent volume at `/app/database` (SQLite, default), **or**
   - attach a Dokploy-managed Postgres/MySQL service and point `DB_*` at it.
5. **Domain & TLS** — Add a domain in Dokploy and enable Let's Encrypt auto-SSL.
6. **Port** — The container listens on `8080` (nginx). Dokploy maps that to your domain automatically.
7. **Deploy** — Click *Deploy*. The container's entrypoint runs `php artisan migrate --force` + recaches config / routes / views before supervisord starts nginx + PHP-FPM + queue worker.

---

## Required environment variables

| Variable | Required | Example | Notes |
| --- | --- | --- | --- |
| `APP_NAME` | yes | `"Asked."` | Display name. Quote it (the trailing dot matters). |
| `APP_ENV` | yes | `production` | |
| `APP_KEY` | yes | `base64:...` | Generate locally with `php artisan key:generate --show`, then paste. |
| `APP_DEBUG` | yes | `false` | Never `true` in production. |
| `APP_URL` | yes | `https://asked.fr` | Full HTTPS URL, no trailing slash. |
| `APP_LOCALE` | no | `en` | Defaults to `en`. |
| `APP_FALLBACK_LOCALE` | no | `en` | |
| `LOG_CHANNEL` | no | `stack` | |
| `LOG_LEVEL` | no | `warning` | `info` or `warning` for production. |
| `DB_CONNECTION` | yes | `sqlite` *or* `pgsql` *or* `mysql` | |
| `DB_DATABASE` | yes | `/app/database/database.sqlite` (sqlite) **or** db name (pgsql/mysql) | |
| `DB_HOST` | if `pgsql`/`mysql` | `db` | From the Dokploy DB service. |
| `DB_PORT` | if `pgsql`/`mysql` | `5432` / `3306` | |
| `DB_USERNAME` | if `pgsql`/`mysql` | `asked` | |
| `DB_PASSWORD` | if `pgsql`/`mysql` | (secret) | |
| `SESSION_DRIVER` | yes | `database` | `redis` if you wire one up. |
| `SESSION_LIFETIME` | no | `120` | Minutes. |
| `SESSION_SECURE_COOKIE` | yes (prod) | `true` | Required when serving over HTTPS. |
| `SESSION_DOMAIN` | optional | `.asked.fr` | Set when sharing sessions across subdomains. |
| `CACHE_STORE` | yes | `database` | Or `redis`. |
| `QUEUE_CONNECTION` | yes | `database` | `sync` is fine for very low traffic. |
| `BROADCAST_CONNECTION` | no | `log` | Asked. does not broadcast events today. |
| `FILESYSTEM_DISK` | no | `local` | |
| `MAIL_MAILER` | yes | `smtp` | Used for password reset, 2FA, team invitations. |
| `MAIL_HOST` | yes | `smtp.postmarkapp.com` | |
| `MAIL_PORT` | yes | `587` | |
| `MAIL_USERNAME` | yes | (provider token) | |
| `MAIL_PASSWORD` | yes | (provider token) | |
| `MAIL_SCHEME` | optional | `tls` | |
| `MAIL_FROM_ADDRESS` | yes | `noreply@asked.fr` | |
| `MAIL_FROM_NAME` | yes | `"${APP_NAME}"` | |
| `TRUSTED_PROXIES` | yes (behind LB) | `*` | Required so `request->ip()` returns the real client. Already wired in `bootstrap/app.php`. |
| `VITE_APP_NAME` | yes | `"Asked."` | Must match `APP_NAME` (baked into the JS bundle at build time). |

> Generate `APP_KEY` once and store it in Dokploy's secrets. Rotating it logs every user out and breaks any encrypted columns or signed URLs.

---

## Database choice

**Option 1 — SQLite + persistent volume (simplest).** Mount a Dokploy volume at `/app/database` and set `DB_CONNECTION=sqlite` + `DB_DATABASE=/app/database/database.sqlite`. Zero infra, but locks you to a single instance and rules out horizontal scaling. Fine for low-traffic / personal deployments.

**Option 2 — Postgres or MySQL (recommended).** Provision a database service in Dokploy, set `DB_CONNECTION=pgsql` (or `mysql`), and fill in `DB_HOST` / `DB_PORT` / `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` from the service. Allows multiple app replicas, easier backups, and managed snapshots.

The migrations are driver-agnostic; switching drivers requires a fresh `php artisan migrate` against the new database.

---

## Trusted proxies

Dokploy fronts every container with a reverse proxy (Traefik), and you'll typically have Cloudflare or another CDN in front of that. Without trusting the proxy, `request->ip()` returns the proxy's IP — which collapses every user's rate-limit bucket into one and breaks `request->isSecure()` detection.

Set `TRUSTED_PROXIES=*` for the simplest case (trust the upstream LB Dokploy already isolated the container behind). For tighter setups, list the proxy CIDRs explicitly. The middleware reads this env var directly — no further code changes needed.

---

## Initial setup after first deploy

1. **Migrations** — Run automatically by `docker/entrypoint.sh` on every container start.
2. **First admin user** — Open the Dokploy terminal for the app container and run:
   ```bash
   php artisan tinker --execute "\App\Models\User::factory()->create(['email' => 'you@example.com', 'password' => bcrypt('change-me')]);"
   ```
   Or simply register through the UI if `Features::registration()` is enabled (it is by default).
3. **Custom domain** — Add it in *Domains* → enable Let's Encrypt → wait for the cert to issue.

---

## Updates

```text
git push origin main  →  Dokploy webhook  →  docker build  →  entrypoint runs migrate --force  →  app restart
```

No manual steps. Vite assets, route/config/view caches, and migrations are rebuilt on each deploy.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `No application encryption key has been specified` | Set `APP_KEY` in Dokploy. |
| `Vite manifest not found at: /app/public/build/manifest.json` | The build phase failed. Check Dokploy's build logs for the `npm run build` step. |
| Sessions not persisting / CSRF token mismatch | Set `SESSION_SECURE_COOKIE=true` and (if using subdomains) `SESSION_DOMAIN`. Make sure `APP_URL` uses `https://`. |
| Rate-limit buckets collide across users | Set `TRUSTED_PROXIES=*` (already wired in `bootstrap/app.php`). |
| `SQLSTATE[HY000] [14] unable to open database file` | The SQLite path isn't writable. Confirm the volume is mounted at `/app/database` and `DB_DATABASE` points inside it. |
| Queue jobs stuck pending | Supervisor runs a single `queue:work`; check `php artisan queue:failed` via Dokploy terminal. For higher throughput, run a dedicated worker. |
| `route:cache` build step fails | All HTTP routes must use `[Controller, 'method']` form. Closures in `routes/web.php` will break this — refactor them into controllers. |
| 502 from nginx | PHP-FPM crashed; check `supervisor` / `php-fpm` logs in Dokploy. Most often caused by an env-var the app reads but doesn't validate. |

---

## Local prod-parity (docker compose)

The repo also ships a `docker-compose.yml` that wires the same Dockerfile to a local Postgres. Useful for testing the production image before pushing:

```bash
APP_KEY=$(php artisan key:generate --show)
DB_PASSWORD=$(openssl rand -hex 16)
APP_KEY="$APP_KEY" DB_PASSWORD="$DB_PASSWORD" docker compose up --build
open http://localhost:8080
```

`docker compose down -v` clears the Postgres volume between runs.

---

## Build the image without docker-compose

```bash
docker build -t asked .
docker run --rm -p 8080:8080 \
  -e APP_KEY="base64:..." \
  -e APP_URL="http://localhost:8080" \
  -e APP_DEBUG=false \
  -e DB_CONNECTION=sqlite \
  -e DB_DATABASE=/app/database/database.sqlite \
  -v "$PWD/database:/app/database" \
  asked
```

The image listens on `8080` (nginx) and runs nginx + PHP-FPM + queue worker via supervisord.
