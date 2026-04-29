# syntax=docker/dockerfile:1.7

# ============================================================================
# Asked. — production Dockerfile
#
# Two-stage build:
#   1. `builder`  Composer + Node, runs `composer install`, `npm ci`,
#                 `npm run build` (which invokes Wayfinder + Vite). The
#                 composer:2.7 image bundles PHP, so Wayfinder's PHP-side
#                 step works during `npm run build`.
#   2. `runtime`  php:8.4-fpm-alpine + nginx + supervisor. Copies the built
#                 vendor/, public/build/, and Wayfinder-generated TS routes
#                 from the builder. Supervisor runs nginx, php-fpm, and a
#                 single queue:work process. Migrations + caches happen at
#                 boot via the entrypoint.
#
# Build:  docker build -t asked .
# Run:    docker run -p 8080:8080 --env-file .env asked
# ============================================================================

# ---------- Stage 1 — Build ------------------------------------------------
FROM composer:2.7 AS builder

# Composer image is alpine-based. Add Node 22 for Vite 8 / @inertiajs/vite.
RUN apk add --no-cache nodejs npm git

WORKDIR /app

# Composer first so this layer caches as long as composer.* don't change.
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction \
        --no-progress

# Then npm deps. Same caching trick.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Now bring the rest of the source in and finalize.
COPY . .

RUN composer dump-autoload --optimize --classmap-authoritative \
    && npm run build \
    && rm -rf node_modules

# ---------- Stage 2 — Runtime ----------------------------------------------
FROM php:8.4-fpm-alpine AS runtime

# PHP extensions Laravel + our packages need. Build-time deps are stripped
# in the same RUN to keep the image lean.
RUN apk add --no-cache \
        bash curl tini \
        nginx supervisor \
        icu-data-full icu-libs \
        libpng libjpeg-turbo libzip libpq libxml2 oniguruma \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-dev libpng-dev libjpeg-turbo-dev libzip-dev \
        postgresql-dev libxml2-dev oniguruma-dev \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath gd intl opcache pcntl \
        pdo pdo_mysql pdo_pgsql \
        zip \
    && apk del .build-deps \
    && rm -rf /var/cache/apk/* /tmp/*

# pdo_sqlite ships in php:alpine via the `sqlite3` extension preloaded;
# verify it's enabled (no compile needed).
RUN docker-php-ext-enable opcache

# Drop in our config / scripts.
COPY docker/php.ini      /usr/local/etc/php/conf.d/asked.ini
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/zz-asked.conf
COPY docker/nginx.conf   /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh    /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app

# Copy the built app from the builder stage. We deliberately re-copy after
# `COPY . .` below to make sure the optimized vendor + public/build win over
# whatever might be lingering in the source tree.
COPY --chown=www-data:www-data . .
COPY --from=builder --chown=www-data:www-data /app/vendor ./vendor
COPY --from=builder --chown=www-data:www-data /app/public/build ./public/build
COPY --from=builder --chown=www-data:www-data /app/bootstrap/cache ./bootstrap/cache

# Storage + cache need to be writable by www-data.
RUN mkdir -p storage/framework/cache storage/framework/sessions \
             storage/framework/views storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache \
    && find storage bootstrap/cache -type d -exec chmod 775 {} \; \
    && find storage bootstrap/cache -type f -exec chmod 664 {} \;

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8080/up || exit 1

# tini = signal forwarding, supervisord = process manager.
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf", "-n"]
