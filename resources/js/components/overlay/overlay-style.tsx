/**
 * Scoped styles for the OBS overlay surface.
 *
 * Strips every inherited background so the streamer's scene shows through
 * (OBS treats `transparent` as the empty canvas). Defines the editorial
 * palette + Fraunces / JetBrains Mono stacks under the `.overlay-root` scope
 * and ships every keyframe used by the four presets so we can stay 100% CSS
 * with no animation library.
 */
export function OverlayStyle() {
    return (
        <style>{`
            html, body, #app {
                background: transparent !important;
                margin: 0;
                padding: 0;
            }

            .overlay-root {
                /* Saffron accent + neutral inks anchored to the editorial system. */
                --ink: oklch(0.16 0.01 60);
                --ink-soft: oklch(0.28 0.012 60);
                --paper: oklch(0.975 0.012 80);
                --accent: oklch(0.74 0.18 60);
                --accent-deep: oklch(0.62 0.2 50);
                --accent-foreground: oklch(0.16 0 0);
                --muted: oklch(0.62 0.02 70);

                /* Broadcast-safe darks for chrome-on-scene readability. */
                --shade-90: oklch(0.16 0.01 60 / 0.92);
                --shade-80: oklch(0.16 0.01 60 / 0.78);
                --shade-60: oklch(0.16 0.01 60 / 0.58);
                --shade-30: oklch(0.16 0.01 60 / 0.28);

                font-family: 'Fraunces', ui-serif, Georgia, serif;
                font-feature-settings: 'ss01', 'ss02';
                color: var(--paper);
                text-rendering: geometricPrecision;
                -webkit-font-smoothing: antialiased;
            }

            .overlay-root .font-display {
                font-family: 'Fraunces', ui-serif, Georgia, serif;
                font-feature-settings: 'ss01', 'ss02';
            }

            .overlay-root .font-mono {
                font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                font-feature-settings: 'tnum', 'zero';
            }

            /* ── Editorial preset ──────────────────────────────────────── */

            @keyframes overlay-editorial-in {
                0%   { transform: translate3d(0, 110%, 0); opacity: 0; }
                60%  { opacity: 1; }
                100% { transform: translate3d(0, 0, 0); opacity: 1; }
            }
            @keyframes overlay-editorial-out {
                0%   { transform: translate3d(0, 0, 0); opacity: 1; }
                100% { transform: translate3d(0, 110%, 0); opacity: 0; }
            }
            @keyframes overlay-editorial-rule {
                0%   { transform: scaleX(0); }
                100% { transform: scaleX(1); }
            }
            @keyframes overlay-editorial-eyebrow {
                0%   { transform: translate3d(-12px, 0, 0); opacity: 0; }
                100% { transform: translate3d(0, 0, 0); opacity: 1; }
            }
            @keyframes overlay-editorial-text {
                0%   { transform: translate3d(0, 18px, 0); opacity: 0; clip-path: inset(0 0 100% 0); }
                100% { transform: translate3d(0, 0, 0); opacity: 1; clip-path: inset(0 0 0 0); }
            }

            .overlay-editorial[data-phase='entering'],
            .overlay-editorial[data-phase='entered'] {
                animation: overlay-editorial-in 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            .overlay-editorial[data-phase='exiting'] {
                animation: overlay-editorial-out 320ms cubic-bezier(0.4, 0, 0.7, 0) both;
            }
            .overlay-editorial[data-phase='entering'] .overlay-editorial__rule,
            .overlay-editorial[data-phase='entered'] .overlay-editorial__rule {
                animation: overlay-editorial-rule 760ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
                transform-origin: left center;
            }
            .overlay-editorial[data-phase='entering'] .overlay-editorial__eyebrow,
            .overlay-editorial[data-phase='entered'] .overlay-editorial__eyebrow {
                animation: overlay-editorial-eyebrow 520ms cubic-bezier(0.22, 1, 0.36, 1) 200ms both;
            }
            .overlay-editorial[data-phase='entering'] .overlay-editorial__body,
            .overlay-editorial[data-phase='entered'] .overlay-editorial__body {
                animation: overlay-editorial-text 720ms cubic-bezier(0.22, 1, 0.36, 1) 280ms both;
            }
            .overlay-editorial[data-phase='entering'] .overlay-editorial__meta,
            .overlay-editorial[data-phase='entered'] .overlay-editorial__meta {
                animation: overlay-editorial-eyebrow 520ms cubic-bezier(0.22, 1, 0.36, 1) 360ms both;
            }

            /* ── Banner Bottom preset ──────────────────────────────────── */

            @keyframes overlay-banner-in {
                0%   { transform: translate3d(0, 100%, 0); }
                100% { transform: translate3d(0, 0, 0); }
            }
            @keyframes overlay-banner-out {
                0%   { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(0, 100%, 0); }
            }
            @keyframes overlay-banner-stripe {
                0%   { transform: scaleX(0); }
                100% { transform: scaleX(1); }
            }
            @keyframes overlay-banner-text {
                0%   { transform: translate3d(28px, 0, 0); opacity: 0; }
                100% { transform: translate3d(0, 0, 0); opacity: 1; }
            }

            .overlay-banner[data-phase='entering'],
            .overlay-banner[data-phase='entered'] {
                animation: overlay-banner-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            .overlay-banner[data-phase='exiting'] {
                animation: overlay-banner-out 280ms cubic-bezier(0.4, 0, 0.7, 0) both;
            }
            .overlay-banner[data-phase='entering'] .overlay-banner__stripe,
            .overlay-banner[data-phase='entered'] .overlay-banner__stripe {
                animation: overlay-banner-stripe 540ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both;
                transform-origin: left center;
            }
            .overlay-banner[data-phase='entering'] .overlay-banner__body,
            .overlay-banner[data-phase='entered'] .overlay-banner__body {
                animation: overlay-banner-text 480ms cubic-bezier(0.22, 1, 0.36, 1) 160ms both;
            }
            .overlay-banner[data-phase='entering'] .overlay-banner__eyebrow,
            .overlay-banner[data-phase='entered'] .overlay-banner__eyebrow {
                animation: overlay-banner-text 380ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
            }

            /* ── Card Corner preset ────────────────────────────────────── */

            @keyframes overlay-card-in {
                0%   { transform: translate3d(120%, 0, 0) rotate(2deg); opacity: 0; }
                70%  { opacity: 1; }
                100% { transform: translate3d(0, 0, 0) rotate(-1deg); opacity: 1; }
            }
            @keyframes overlay-card-out {
                0%   { transform: translate3d(0, 0, 0) rotate(-1deg); opacity: 1; }
                100% { transform: translate3d(120%, 0, 0) rotate(2deg); opacity: 0; }
            }
            @keyframes overlay-card-pulse {
                0%, 100% { opacity: 0.55; }
                50%      { opacity: 1; }
            }

            .overlay-card[data-phase='entering'],
            .overlay-card[data-phase='entered'] {
                animation: overlay-card-in 540ms cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            .overlay-card[data-phase='exiting'] {
                animation: overlay-card-out 320ms cubic-bezier(0.4, 0, 0.7, 0) both;
            }
            .overlay-card__pulse {
                animation: overlay-card-pulse 2.4s ease-in-out infinite;
            }

            /* ── Quote preset ──────────────────────────────────────────── */

            @keyframes overlay-quote-in {
                0%   { transform: scale(0.96); opacity: 0; filter: blur(8px); }
                100% { transform: scale(1);    opacity: 1; filter: blur(0); }
            }
            @keyframes overlay-quote-out {
                0%   { transform: scale(1);    opacity: 1; filter: blur(0); }
                100% { transform: scale(1.02); opacity: 0; filter: blur(6px); }
            }
            @keyframes overlay-quote-mark {
                0%   { transform: translate3d(0, 16px, 0) scale(0.9); opacity: 0; }
                100% { transform: translate3d(0, 0, 0) scale(1);      opacity: 1; }
            }
            @keyframes overlay-quote-vignette {
                0%   { opacity: 0; }
                100% { opacity: 1; }
            }

            .overlay-quote[data-phase='entering'],
            .overlay-quote[data-phase='entered'] {
                animation: overlay-quote-in 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            .overlay-quote[data-phase='exiting'] {
                animation: overlay-quote-out 320ms cubic-bezier(0.4, 0, 0.7, 0) both;
            }
            .overlay-quote[data-phase='entering'] .overlay-quote__mark,
            .overlay-quote[data-phase='entered'] .overlay-quote__mark {
                animation: overlay-quote-mark 760ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
            }
            .overlay-quote[data-phase='entering'] .overlay-quote__byline,
            .overlay-quote[data-phase='entered'] .overlay-quote__byline {
                animation: overlay-quote-mark 600ms cubic-bezier(0.22, 1, 0.36, 1) 360ms both;
            }
            .overlay-quote__vignette {
                animation: overlay-quote-vignette 900ms ease-out both;
            }
        `}</style>
    );
}
