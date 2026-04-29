import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { AuthSpine } from '@/components/auth/auth-spine';
import {
    EditorialGrain,
    EditorialStyleVariables,
} from '@/components/editorial-chrome';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

type Props = {
    children: ReactNode;
    title?: string;
    description?: string;
};

/**
 * Two-column editorial lobby. Left column hosts the form; right column is the
 * publication's "spine" — typeset masthead and pull-quote. Mobile collapses
 * to a single column with a slim header in place of the spine.
 */
export function AuthShell({ children, title, description }: Props) {
    const { t } = useTranslate();

    return (
        <div className="editorial-root relative min-h-svh bg-[var(--page-bg)] text-foreground antialiased">
            <EditorialStyleVariables />
            <EditorialGrain />

            <div className="relative z-10 grid min-h-svh md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                <div
                    className={cn(
                        'flex min-h-svh flex-col px-6 pt-7 pb-10 md:min-h-0 md:px-10 md:pt-9 md:pb-12 lg:px-14 lg:pt-12',
                    )}
                >
                    <header className="flex items-center justify-between">
                        <Link
                            href={home().url}
                            className="group font-display inline-flex items-baseline gap-2 text-xl tracking-tight text-foreground"
                        >
                            <span className="font-display text-2xl leading-none font-semibold">
                                Asked
                            </span>
                            <span
                                aria-hidden="true"
                                className="text-[var(--accent-ink)]"
                            >
                                .
                            </span>
                            <span className="hidden font-mono text-[10px] tracking-[0.32em] text-foreground/50 uppercase sm:inline">
                                {t('auth.shell.masthead_tagline')}
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <LocaleSwitcher variant="inline" />
                            <span aria-hidden="true" className="text-border">
                                /
                            </span>
                            <Link
                                href={home().url}
                                className="font-mono text-[10px] tracking-[0.28em] text-foreground/60 uppercase transition-colors hover:text-foreground"
                            >
                                {t('auth.shell.back')}
                            </Link>
                        </div>
                    </header>

                    <main className="mt-12 flex flex-1 items-start md:mt-16 lg:mt-24">
                        <div className="mx-auto w-full max-w-md">
                            {(title || description) && (
                                <header className="mb-9">
                                    <p className="font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                                        {t('auth.shell.lobby_eyebrow')}
                                    </p>
                                    {title ? (
                                        <h1
                                            className={cn(
                                                'font-display mt-3 text-4xl leading-[1.02] font-semibold tracking-tight text-balance text-foreground',
                                                'sm:text-5xl',
                                            )}
                                        >
                                            {title}
                                            <span className="text-[var(--accent-ink)]">
                                                .
                                            </span>
                                        </h1>
                                    ) : null}
                                    {description ? (
                                        <p className="font-display mt-4 max-w-md text-base leading-relaxed text-foreground/75 sm:text-lg">
                                            {description}
                                        </p>
                                    ) : null}
                                </header>
                            )}

                            <div className="auth-form">{children}</div>
                        </div>
                    </main>

                    <footer className="mt-12 flex flex-col items-start gap-3 font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                        <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <span>
                                <span className="text-foreground/70">
                                    Asked.
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="mx-2 text-border"
                                >
                                    /
                                </span>
                                {t('auth.shell.editorial_offices')}
                            </span>
                            <span className="hidden sm:inline">
                                {t('auth.shell.door_open')}
                            </span>
                        </div>
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-foreground/55">
                            <span>{t('credits.partnership.lead')}</span>
                            {/* TODO: replace href once NQNT-SOURCE URL is provided. */}
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground/80 transition-colors hover:text-foreground"
                            >
                                {t('credits.partnership.partner_name')}
                            </a>
                            <span
                                aria-hidden="true"
                                className="text-[var(--accent-ink)]"
                            >
                                —
                            </span>
                            <span>
                                {t('credits.partnership.partner_descriptor')}
                            </span>
                        </p>
                    </footer>
                </div>

                <AuthSpine />
            </div>

            <AuthFormStyles />
        </div>
    );
}

/**
 * Scoped restyle for the inner form fields & buttons so each auth page picks
 * up the editorial chrome without changing the per-page markup. We bind to
 * `data-slot` attributes the shadcn primitives already emit.
 */
function AuthFormStyles() {
    return (
        <style>{`
            .auth-form [data-slot="label"] {
                font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                font-size: 10px;
                letter-spacing: 0.28em;
                text-transform: uppercase;
                color: oklch(from var(--foreground) l c h / 0.7);
            }
            .auth-form [data-slot="input"] {
                height: 3rem;
                border-radius: 0;
                border-width: 0 0 1px 0;
                border-color: oklch(from var(--foreground) l c h / 0.18);
                background-color: transparent;
                box-shadow: none;
                padding-left: 0;
                padding-right: 0;
                font-size: 1rem;
                font-family: 'Fraunces', ui-serif, Georgia, serif;
                transition: border-color 200ms ease;
            }
            .auth-form [data-slot="input"]:focus-visible {
                border-color: var(--accent-ink);
                box-shadow: 0 1px 0 0 var(--accent-ink);
                outline: none;
            }
            .auth-form [data-slot="input"][readonly] {
                color: oklch(from var(--foreground) l c h / 0.6);
            }
            .auth-form .relative [data-slot="input"] {
                padding-right: 2.5rem;
            }
            .auth-form [data-slot="button"] {
                height: 3rem;
                border-radius: 9999px;
                font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                letter-spacing: 0.18em;
                text-transform: uppercase;
                font-size: 11px;
            }
            .auth-form [data-slot="checkbox"] {
                border-radius: 2px;
                border-color: oklch(from var(--foreground) l c h / 0.35);
            }
            .auth-form [data-slot="checkbox"][data-state="checked"] {
                background-color: var(--accent-ink);
                border-color: var(--accent-ink);
                color: oklch(0.16 0 0);
            }
        `}</style>
    );
}
