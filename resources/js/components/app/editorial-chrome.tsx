/**
 * Scoped style block for the authenticated app shell — the production room
 * variant of the editorial language. Same Fraunces + JetBrains Mono pairing
 * and cream/ink palette as the public page, the desk, and the auth lobby,
 * tuned for sustained back-of-house work: tighter rhythms, more rules, less
 * pulse. Wrap the whole shell in `.editorial-app-root` and drop one instance
 * of {@link EditorialAppStyleVariables} near the root.
 *
 * Bonus selectors restyle the shadcn sidebar primitives (`[data-sidebar=…]`)
 * and the sidebar-trigger so we don't have to fork those files.
 */
export function EditorialAppStyleVariables() {
    return (
        <style>{`
            .editorial-app-root {
                --accent-ink: oklch(0.68 0.18 50);
                --accent-foreground: oklch(0.16 0 0);
                --page-bg: oklch(0.975 0.012 80);
                --paper-line: oklch(0.88 0.02 70 / 0.55);
                --rule-strong: oklch(0.18 0.02 60 / 0.18);
                --press-ink: oklch(0.18 0.02 60);
                --press-mute: oklch(0.18 0.02 60 / 0.55);
                --stamp-ink: oklch(0.42 0.16 30);
                font-family: 'Fraunces', ui-serif, Georgia, serif;
                background-color: var(--page-bg);
                color: var(--press-ink);
            }
            .editorial-app-root .font-display {
                font-family: 'Fraunces', ui-serif, Georgia, serif;
                font-feature-settings: 'ss01', 'ss02';
            }
            .editorial-app-root .font-mono {
                font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
            }
            .editorial-app-root .editorial-rule {
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

            /* Sidebar surface — paper, not toolkit grey. */
            .editorial-app-root [data-slot="sidebar-wrapper"] {
                --sidebar: var(--page-bg);
                --sidebar-foreground: var(--press-ink);
                --sidebar-border: oklch(0.18 0.02 60 / 0.12);
                --sidebar-accent: oklch(0.18 0.02 60 / 0.04);
                --sidebar-accent-foreground: var(--press-ink);
                --sidebar-primary: var(--accent-ink);
                --sidebar-primary-foreground: var(--accent-foreground);
                --sidebar-ring: var(--accent-ink);
            }
            .editorial-app-root [data-sidebar="sidebar"] {
                background-color: var(--page-bg);
            }
            .editorial-app-root [data-slot="sidebar-inset"] {
                background-color: var(--page-bg);
            }

            /* Active nav item: saffron tick on the leading edge, not a pill. */
            .editorial-app-root [data-sidebar="menu-button"] {
                position: relative;
                border-radius: 0;
                padding-left: 0.875rem;
                padding-right: 0.625rem;
                color: oklch(0.18 0.02 60 / 0.78);
                transition: color 200ms ease, background-color 200ms ease;
            }
            .editorial-app-root [data-sidebar="menu-button"]:hover {
                background-color: oklch(0.18 0.02 60 / 0.04);
                color: var(--press-ink);
            }
            .editorial-app-root [data-sidebar="menu-button"][data-active="true"] {
                background-color: transparent;
                color: var(--press-ink);
                font-weight: 500;
            }
            .editorial-app-root [data-sidebar="menu-button"][data-active="true"]::before {
                content: "";
                position: absolute;
                inset: 0.375rem auto 0.375rem 0;
                width: 2px;
                background-color: var(--accent-ink);
                border-radius: 2px;
            }

            /* Group label = caps-mono editorial slug. */
            .editorial-app-root [data-sidebar="group-label"] {
                font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                font-size: 9px;
                letter-spacing: 0.32em;
                text-transform: uppercase;
                color: oklch(0.18 0.02 60 / 0.5);
                height: auto;
                padding: 0.875rem 0.875rem 0.5rem;
            }

            /* Trigger reads like an editorial chip. */
            .editorial-app-root [data-sidebar="trigger"] {
                font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                color: oklch(0.18 0.02 60 / 0.6);
                border-radius: 9999px;
                height: 1.75rem;
                width: 1.75rem;
            }
            .editorial-app-root [data-sidebar="trigger"]:hover {
                background-color: oklch(0.18 0.02 60 / 0.05);
                color: var(--press-ink);
            }

            .dark .editorial-app-root {
                --accent-ink: oklch(0.78 0.18 60);
                --accent-foreground: oklch(0.16 0.01 60);
                --page-bg: oklch(0.16 0.008 80);
                --paper-line: oklch(0.32 0.02 80 / 0.55);
                --rule-strong: oklch(0.82 0.02 80 / 0.22);
                --press-ink: oklch(0.92 0.01 80);
                --press-mute: oklch(0.92 0.01 80 / 0.55);
                --stamp-ink: oklch(0.78 0.18 30);
            }
            .dark .editorial-app-root [data-slot="sidebar-wrapper"] {
                --sidebar-border: oklch(0.92 0.01 80 / 0.12);
                --sidebar-accent: oklch(0.92 0.01 80 / 0.05);
            }
            .dark .editorial-app-root [data-sidebar="menu-button"] {
                color: oklch(0.92 0.01 80 / 0.72);
            }
            .dark .editorial-app-root [data-sidebar="menu-button"]:hover {
                background-color: oklch(0.92 0.01 80 / 0.06);
            }
            .dark .editorial-app-root [data-sidebar="group-label"] {
                color: oklch(0.92 0.01 80 / 0.5);
            }
        `}</style>
    );
}

/**
 * Fractal-noise paper grain plus a small saffron glow off-canvas. Restrained
 * compared to the public page so it doesn't fight long sessions.
 */
export function EditorialAppGrain() {
    return (
        <>
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.045] mix-blend-multiply dark:opacity-[0.07] dark:mix-blend-overlay"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none fixed -top-40 right-[-20%] z-0 size-[520px] rounded-full bg-[var(--accent-ink)]/[0.12] blur-[140px]"
            />
        </>
    );
}
