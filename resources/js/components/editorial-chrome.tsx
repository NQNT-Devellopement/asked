/**
 * Shared visual chrome for the Editorial / Newsroom design language.
 *
 * Three surfaces share this language:
 *   - the public FAQ page (front-of-house)
 *   - the creator desk (back-of-house, see {@link ./questions/desk-chrome})
 *   - the marketing home + auth shell (cover & lobby)
 *
 * Drop {@link EditorialStyleVariables} once near the page root to scope the
 * accent / cream palette and Fraunces + JetBrains Mono font stacks. Pair it
 * with {@link EditorialGrain} for the fractal-noise grain plus saffron radial
 * glow so every editorial surface breathes the same air.
 */
export function EditorialStyleVariables() {
    return (
        <style>{`
            .editorial-root {
                --accent-ink: oklch(0.68 0.18 50);
                --accent-foreground: oklch(0.16 0 0);
                --page-bg: oklch(0.975 0.012 80);
                --paper-line: oklch(0.88 0.02 70 / 0.55);
                --rule-strong: oklch(0.18 0.02 60 / 0.18);
                --stamp-ink: oklch(0.42 0.16 30);
                font-family: 'Fraunces', ui-serif, Georgia, serif;
            }
            .editorial-root .font-display {
                font-family: 'Fraunces', ui-serif, Georgia, serif;
                font-feature-settings: 'ss01', 'ss02';
            }
            .editorial-root .font-mono {
                font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
            }
            .editorial-root .editorial-rule {
                background-image: linear-gradient(
                    to right,
                    var(--rule-strong) 0,
                    var(--rule-strong) 6px,
                    transparent 6px,
                    transparent 12px
                );
                background-size: 12px 1px;
                background-repeat: repeat-x;
            }
            .dark .editorial-root {
                --accent-ink: oklch(0.78 0.18 60);
                --accent-foreground: oklch(0.16 0.01 60);
                --page-bg: oklch(0.16 0.008 80);
                --paper-line: oklch(0.32 0.02 80 / 0.55);
                --rule-strong: oklch(0.82 0.02 80 / 0.22);
                --stamp-ink: oklch(0.78 0.18 30);
            }
        `}</style>
    );
}

/**
 * Fractal-noise grain (~6% in light, ~8% in dark) plus a saffron ceiling
 * gradient. Optional bottom-right glow can be enabled with `withGlow`.
 */
export function EditorialGrain({ withGlow = false }: { withGlow?: boolean }) {
    return (
        <>
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.06] mix-blend-multiply dark:opacity-[0.08] dark:mix-blend-overlay"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[520px] bg-gradient-to-b from-[var(--accent-ink)]/[0.07] via-transparent to-transparent"
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
 * Wire-service style eyebrow: hairline dot + caps-mono label, optionally with
 * a tabular count. Reusable across surfaces.
 */
export function EditorialSlug({
    label,
    accent = false,
    count,
}: {
    label: string;
    accent?: boolean;
    count?: number | string;
}) {
    return (
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.32em] text-muted-foreground uppercase">
            <span
                aria-hidden="true"
                className={
                    accent
                        ? 'inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-ink)]'
                        : 'inline-block h-1.5 w-1.5 rounded-full bg-foreground/30'
                }
            />
            {label}
            {count !== undefined ? (
                <>
                    <span aria-hidden="true" className="text-border">
                        &middot;
                    </span>
                    <span className="text-foreground/70 tabular-nums">
                        {typeof count === 'number'
                            ? count.toString().padStart(2, '0')
                            : count}
                    </span>
                </>
            ) : null}
        </div>
    );
}
