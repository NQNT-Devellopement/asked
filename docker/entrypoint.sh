#!/bin/sh
# Asked. — container entrypoint
#
# Runs once per container start, BEFORE supervisord takes over:
#   1. Make sure SQLite path + writable Laravel dirs are owned by www-data
#      (volumes mounted at runtime override the image's chown).
#   2. Wait briefly for the DB (skipped when DB_CONNECTION=sqlite).
#   3. Run migrations (idempotent).
#   4. Re-cache config / routes / views (env vars may differ from the
#      cache baked into the image at build time).
#   5. Symlink public/storage if not already present.
#   6. Re-chown the writable paths once more (caches above run as root and
#      may have written files www-data wouldn't otherwise own).
#   7. exec the CMD (supervisord by default).

set -e

cd /app

echo "[entrypoint] Asked. starting..."

# --- helpers --------------------------------------------------------------
fix_writable_paths() {
    chown -R www-data:www-data /app/storage /app/bootstrap/cache 2>/dev/null || true
    chmod -R u+rwX,g+rwX       /app/storage /app/bootstrap/cache 2>/dev/null || true

    if [ "${DB_CONNECTION:-}" = "sqlite" ]; then
        SQLITE_PATH="${DB_DATABASE:-/app/database/database.sqlite}"
        SQLITE_DIR="$(dirname "$SQLITE_PATH")"
        mkdir -p "$SQLITE_DIR"
        [ -f "$SQLITE_PATH" ] || touch "$SQLITE_PATH"
        chown -R www-data:www-data "$SQLITE_DIR" 2>/dev/null || true
        chmod 775 "$SQLITE_DIR" 2>/dev/null || true
        chmod 664 "$SQLITE_PATH" 2>/dev/null || true
    fi
}

# --- 1. Initial permissions pass -----------------------------------------
fix_writable_paths

if [ "${DB_CONNECTION:-}" = "sqlite" ]; then
    echo "[entrypoint] SQLite ready at ${DB_DATABASE:-/app/database/database.sqlite}"
fi

# --- 2. Wait for remote DB ------------------------------------------------
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

# --- 3. Migrations --------------------------------------------------------
echo "[entrypoint] running migrations..."
php artisan migrate --force --no-interaction || {
    echo "[entrypoint] migration failed — see log above. Container will start anyway."
}

# --- 4. Re-cache with the runtime env -------------------------------------
echo "[entrypoint] caching config / routes / views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache || true

# --- 5. Storage symlink ---------------------------------------------------
php artisan storage:link 2>/dev/null || true

# --- 6. Final permissions pass --------------------------------------------
# Migrations + caches above ran as root, so anything they wrote (the SQLite
# file, the journal, the cache files, the view cache) is now root-owned.
# Hand it back to www-data before PHP-FPM tries to read/write.
fix_writable_paths

echo "[entrypoint] handing off to: $*"

# --- 7. Hand off to CMD ---------------------------------------------------
exec "$@"
