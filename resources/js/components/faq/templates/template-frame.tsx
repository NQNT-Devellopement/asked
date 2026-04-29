import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Fractal-noise grain overlay shared across the 3 public templates. Each
 * template can opt in or skip it — minimal keeps the saffron glow,
 * grid keeps grain only, timeline goes restrained (grain only, no glow).
 *
 * Reads from CSS variables emitted by `themeStyleVariables` so a single
 * overlay reacts to whichever background is in play.
 */
export function TemplateGrain({ withGlow = false }: { withGlow?: boolean }) {
    return (
        <>
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    opacity: 'var(--page-grain-opacity, 0.06)',
                    mixBlendMode:
                        'var(--page-grain-blend, multiply)' as React.CSSProperties['mixBlendMode'],
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] bg-gradient-to-b from-[var(--accent-ink)]/[0.07] via-transparent to-transparent"
            />
            {withGlow ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-32 right-[-10%] z-0 size-[420px] rounded-full bg-[var(--accent-ink)]/[0.18] blur-[120px] sm:size-[560px]"
                />
            ) : null}
        </>
    );
}

/**
 * Editorial slug used across templates: hairline dot + caps mono label,
 * optional tabular count.
 */
export function TemplateSlug({
    label,
    accent = false,
    count,
    className,
}: {
    label: string;
    accent?: boolean;
    count?: number | string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex items-center gap-2 font-mono text-[10px] tracking-[0.32em] uppercase',
                'text-[color:var(--page-muted)]',
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    'inline-block h-1.5 w-1.5 rounded-full',
                    accent
                        ? 'bg-[var(--accent-ink)]'
                        : 'bg-[color:var(--page-ink)]/30',
                )}
            />
            {label}
            {count !== undefined ? (
                <>
                    <span
                        aria-hidden="true"
                        className="text-[color:var(--page-rule)]"
                    >
                        &middot;
                    </span>
                    <span className="text-[color:var(--page-ink)]/70 tabular-nums">
                        {typeof count === 'number'
                            ? count.toString().padStart(2, '0')
                            : count}
                    </span>
                </>
            ) : null}
        </div>
    );
}

/**
 * Footer printed at the bottom of every template — mono caps team slug +
 * the boilerplate "questions reviewed before they appear" tag.
 */
export function TemplateFooter({
    teamName,
    teamSlug,
}: {
    teamName: string;
    teamSlug: string;
}) {
    const { t } = useTranslate();

    return (
        <footer className="relative z-10 border-t border-[color:var(--page-border)]">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 sm:px-8 lg:px-12">
                <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-[0.28em] text-[color:var(--page-muted)] uppercase">
                    <span>{t('credits.partnership.lead')}</span>
                    {/* TODO: replace href once NQNT-SOURCE URL is provided. */}
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono tracking-[0.22em] text-[color:var(--page-ink)]/85 transition-colors hover:text-[var(--accent-ink)]"
                    >
                        {t('credits.partnership.partner_name')}
                    </a>
                    <span
                        aria-hidden="true"
                        className="text-[var(--accent-ink)]"
                    >
                        —
                    </span>
                    <span>{t('credits.partnership.partner_descriptor')}</span>
                </p>
                <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="font-mono text-[10px] tracking-[0.28em] text-[color:var(--page-muted)] uppercase">
                        <span className="text-[color:var(--page-ink)]/80">
                            {teamName}
                        </span>
                        <span
                            aria-hidden="true"
                            className="mx-2 text-[color:var(--page-rule)]"
                        >
                            /
                        </span>
                        {teamSlug}
                        <span
                            aria-hidden="true"
                            className="mx-2 text-[color:var(--page-rule)]"
                        >
                            /
                        </span>
                        Asked
                        <span className="text-[var(--accent-ink)]">.</span>
                    </div>
                    <p className="text-xs text-[color:var(--page-muted)]">
                        {t('faq.footer.review_notice')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
