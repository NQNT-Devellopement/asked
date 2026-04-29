#!/bin/sh
# Asked. — container entrypoint
#
# Runs once per container start, BEFORE supervisord takes over:
#   1. Wait briefly for the database (gives Dokploy / docker-compose's
#      depends_on time to bring up Postgres / MySQL).
#   2. Run migrations (idempotent — `migrate --force` is a no-op when
#      already up to date).
#   3. Re-cache config / routes / views (env vars may differ from the
#      cache baked into the image at build time).
#   4. Symlink public/storage if not already present.
#   5. exec the CMD (supervisord by default).

set -e

cd /app

echo "[entrypoint] Asked. starting..."

# --- 1. Wait for DB (only when DB_HOST is set; SQLite skips this) ---------
if [ -n "${DB_HOST:-}" ] && [ "${DB_CONNECTION:-}" != "sqlite" ]; then
    echo "[entrypoint] waiting for database at ${DB_HOST}:${DB_PORT:-5432}..."
    tries=0
    until nc -z "${DB_HOST}" "${DB_PORT:-5432}" 2>/dev/null; do
        tries=$((tries + 1))
        if [ "$tries" -gt 30 ]; then
            echo "[entrypoint] database did not become reachable after 30 attempts — continuing anyway"
            break
        fi
        sleep 1
    done
fi

# --- 2. Migrations -------------------------------------------------------
echo "[entrypoint] running migrations..."
php artisan migrate --force --no-interaction || {
    echo "[entrypoint] migration failed — see log above. Container will start anyway."
}

# --- 3. Re-cache with the runtime env ------------------------------------
echo "[entrypoint] caching config / routes / views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache || true

# --- 4. Storage symlink --------------------------------------------------
php artisan storage:link 2>/dev/null || true

echo "[entrypoint] handing off to: $*"

# --- 5. Hand off to CMD --------------------------------------------------
exec "$@"
