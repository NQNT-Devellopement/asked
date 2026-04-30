import { useTranslate } from '@/lib/i18n';
import type { PresetProps } from './types';

/**
 * Quote preset: full-screen editorial pull-quote.
 *
 * Inspired by the cold-open title card on a documentary: a centered Fraunces
 * italic pull-quote dominates ~70% of the viewport, flanked by oversized
 * decorative quotation marks, with a subtle radial vignette darkening the
 * scene just enough for legibility. The quote scales + blurs in; the marks
 * and byline stagger in after. Designed for big "this is THE question"
 * moments — not for high-frequency rotation.
 */
export function QuotePreset({ question, team, phase }: PresetProps) {
    const { t } = useTranslate();
    const author =
        question.authorName?.trim() || t('overlay.eyebrow.anonymous');

    return (
        <div
            className="overlay-quote absolute inset-0 flex items-center justify-center"
            data-phase={phase}
            aria-label={t('overlay.aria.live_region')}
        >
            {/* Radial vignette — darkest in the corners, transparent at center. */}
            <div
                aria-hidden="true"
                className="overlay-quote__vignette absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse at center, transparent 0%, oklch(0.12 0.008 60 / 0.55) 55%, oklch(0.1 0.008 60 / 0.85) 100%)',
                }}
            />

            {/* Saffron film grain seam at top + bottom for editorial framing. */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-8 h-[1px]"
                style={{
                    background:
                        'linear-gradient(to right, transparent 0%, var(--accent) 30%, var(--accent) 70%, transparent 100%)',
                    opacity: 0.5,
                }}
            />
            <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-8 h-[1px]"
                style={{
                    background:
                        'linear-gradient(to right, transparent 0%, var(--accent) 30%, var(--accent) 70%, transparent 100%)',
                    opacity: 0.5,
                }}
            />

            <figure className="relative flex w-full max-w-[78%] flex-col items-center gap-10 px-12 text-center">
                {/* Top quotation mark — oversized italic Fraunces glyph. */}
                <div
                    aria-hidden="true"
                    className="overlay-quote__mark font-display text-[clamp(8rem,14vw,16rem)] leading-none italic"
                    style={{
                        color: 'var(--accent)',
                        textShadow:
                            '0 18px 60px oklch(0.62 0.2 50 / 0.35), 0 2px 0 oklch(0 0 0 / 0.4)',
                        marginBottom: '-0.6em',
                    }}
                >
                    “
                </div>

                <blockquote
                    className="font-display text-[clamp(2.6rem,4.6vw,5.4rem)] leading-[1.06] tracking-[-0.02em] italic"
                    style={{
                        color: 'var(--paper)',
                        textShadow:
                            '0 4px 18px oklch(0 0 0 / 0.45), 0 1px 0 oklch(0 0 0 / 0.3)',
                    }}
                >
                    {question.body}
                </blockquote>

                <figcaption className="overlay-quote__byline flex flex-col items-center gap-3">
                    {/* Decorative dotted rule — wire-service style. */}
                    <span
                        aria-hidden="true"
                        className="block h-[2px] w-16"
                        style={{ background: 'var(--accent)' }}
                    />
                    <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.4em] uppercase opacity-90">
                        <span style={{ color: 'var(--accent)' }}>
                            {t('overlay.eyebrow.from')}
                        </span>
                        <span style={{ color: 'var(--paper)' }}>{author}</span>
                        <span aria-hidden="true" className="opacity-30">
                            ·
                        </span>
                        <span
                            className="font-display tracking-tight italic"
                            style={{ color: 'var(--accent)' }}
                        >
                            {t('overlay.eyebrow.asked')}
                        </span>
                        <span
                            style={{ color: 'var(--paper)' }}
                            className="opacity-50"
                        >
                            /{team.slug}
                        </span>
                    </div>
                </figcaption>
            </figure>
        </div>
    );
}
