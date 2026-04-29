# Asked.

*A public FAQ page for creators — your readers ask, you answer in public.*

Asked. is a lightweight, opinionated FAQ tool for creators, artists, and communities. Visitors submit questions on a public page; you triage, organize, and answer them in the open — linking each answer to the platform where you said it (a video, a stream, a tweet, a track). Built in partnership with **NQNT-SOURCE**, Vald's official server, for the creators in his orbit and beyond.

## Features

- **Public FAQ page** at a custom slug — share one link that holds every answer.
- **Anonymous question submission** — no account required for your audience.
- **Moderation inbox** — review, approve, or dismiss incoming questions before they go public.
- **Drag-and-drop board** organized by lists — group questions the way you think.
- **Answer with a source URL** — paste a YouTube, Twitch, X, TikTok, Instagram, Spotify, or generic web link; the platform is auto-detected.
- **3 layout templates** — Minimal, Grid, Timeline.
- **4 paper-stock backgrounds** (Cream, Ink, Paper, Noir) plus a custom accent color.
- **Multi-team support** — community managers can run several creators' pages from one account, with Owner / Admin / Member roles.
- **EN / FR i18n** — full English and French translations out of the box.
- **2FA-ready auth** powered by Laravel Fortify.

## Tech stack

- **PHP 8.4** · **Laravel 13**
- **Inertia.js v3** (React adapter)
- **React 19** with the React Compiler
- **Tailwind CSS v4**
- **Laravel Fortify** — authentication, including TOTP two-factor
- **Laravel Wayfinder** — typed TypeScript routes generated from the backend
- **Pest 4** — testing
- **SQLite** by default (one file, no setup)

## Screenshots

> Screenshots coming.

![Public FAQ page](docs/img/public.png)
![Moderation board](docs/img/board.png)
![Settings — appearance](docs/img/appearance.png)

## Getting started (local dev)

Requirements: PHP 8.4, Composer, Node 20+, npm.

```bash
git clone https://github.com/your-org/asked.git
cd asked

# 1. Environment
cp .env.example .env

# 2. Install + key + migrations + build, all in one (creates database/database.sqlite)
composer run setup

# 3. Generate the app key (skip if `composer run setup` already did)
php artisan key:generate

# 4. Run everything (Laravel server + queue + logs + Vite dev server)
composer run dev
```

The default database is **SQLite** — the file at `database/database.sqlite` is created automatically by `composer run setup`. Switch to MySQL or Postgres by editing `DB_*` variables in `.env`.

Once `composer run dev` is up, the app is at `http://localhost:8000`.

## Common commands

| Task | Command |
| --- | --- |
| Run everything (server + queue + logs + Vite) | `composer run dev` |
| Frontend only | `npm run dev` |
| Build frontend assets | `npm run build` |
| Build with SSR | `npm run build:ssr` |
| Run all tests | `php artisan test --compact` |
| Filter tests by name | `php artisan test --compact --filter=testName` |
| Lint PHP | `vendor/bin/pint` |
| Lint JS / TS | `npm run lint` |
| Format JS / TS / CSS | `npm run format` |
| Type-check TS | `npm run types:check` |
| Full CI suite | `composer run ci:check` |

## Deployment

For deploying Asked. to production (Laravel Cloud, a VPS, or any container platform), see [`DEPLOYMENT.md`](DEPLOYMENT.md). The short version: configure `APP_KEY`, switch `DB_CONNECTION` to a managed database, point `MAIL_*` at a real provider, set `SESSION_SECURE_COOKIE=true`, and run `composer install --no-dev` + `npm run build`.

## Internationalization

Translations live in `lang/en/` and `lang/fr/` as PHP files. The frontend reads them through a `t()` hook backed by Inertia shared props. To add a string, drop it into both locale files using the same key. To add a locale, copy the `lang/en/` directory and translate.

The locale is set via `APP_LOCALE` in `.env` (default `en`).

## License

Released under the [MIT License](LICENSE) — © 2026 Asked. — NQNT-SOURCE.

## Credits

Built with and for **NQNT-SOURCE**, Vald's official Discord server. Thanks to the community managers and moderators there for shaping the moderation flow, and to the creators who tested the early builds.

Asked. stands on the shoulders of [Laravel](https://laravel.com), [Inertia.js](https://inertiajs.com), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com), and [shadcn/ui](https://ui.shadcn.com).
