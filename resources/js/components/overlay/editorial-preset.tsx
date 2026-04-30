import { useTranslate } from '@/lib/i18n';
import type { PresetProps } from './types';

/**
 * Editorial preset: lower-third newsroom chyron.
 *
 * Magazine masthead language ported to broadcast: a bottom-third dark band
 * with backdrop-blur, a saffron rule that wipes in left-to-right, oversized
 * Fraunces serif body that reveals via clip-path, and a JetBrains Mono
 * eyebrow tagging the source. Built to feel like the lower-third of a
 * late-night-show interview rather than a generic Twitch overlay.
 */
export function EditorialPreset({ question, team, phase }: PresetProps) {
    const { t } = useTranslate();
    const author =
        question.authorName?.trim() || t('overlay.eyebrow.anonymous');
    const list = question.list?.name;
    const number = question.position > 0 ? question.position : question.id;

    return (
        <div
            className="overlay-editorial absolute right-0 bottom-0 left-0"
            data-phase={phase}
            aria-label={t('overlay.aria.live_region')}
        >
            {/* Backdrop band — dense at the bottom, fading toward the top edge so the scene bleeds through. */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[42vh]"
                style={{
                    background:
                        'linear-gradient(to top, var(--shade-90) 0%, var(--shade-80) 32%, var(--shade-30) 78%, transparent 100%)',
                    backdropFilter: 'blur(14px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(14px) saturate(120%)',
                }}
            />

            {/* Hairline saffron rule — wipes in from left. */}
            <div
                aria-hidden="true"
                className="overlay-editorial__rule absolute right-12 bottom-[34vh] left-12 h-[2px]"
                style={{
                    background:
                        'linear-gradient(to right, var(--accent) 0%, var(--accent-deep) 60%, transparent 100%)',
                }}
            />

            <div className="relative grid gap-5 px-12 pt-8 pb-12 lg:px-20 lg:pt-12 lg:pb-16">
                {/* Eyebrow row: dot, mono caps, divider, author. */}
                <div className="overlay-editorial__eyebrow flex items-center gap-3 font-mono text-[11px] tracking-[0.32em] uppercase">
                    <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: 'var(--accent)' }}
                    />
                    <span style={{ color: 'var(--accent)' }}>
                        {t('overlay.eyebrow.asked')}
                    </span>
                    <span aria-hidden="true" className="opacity-30">
                        ──
                    </span>
                    <span className="opacity-80">
                        {t('overlay.eyebrow.question')} ·{' '}
                        <span className="tabular-nums">
                            {number.toString().padStart(3, '0')}
                        </span>
                    </span>
                    <span aria-hidden="true" className="opacity-30">
                        ──
                    </span>
                    <span className="opacity-80">
                        {t('overlay.eyebrow.from')} {author}
                    </span>
                </div>

                {/* Body: oversized Fraunces, italic accent for opening glyph. */}
                <p
                    className="overlay-editorial__body font-display text-[clamp(2.4rem,3.6vw,4.2rem)] leading-[1.04] tracking-[-0.012em]"
                    style={{ color: 'var(--paper)' }}
                >
                    <span
                        aria-hidden="true"
                        className="mr-2 italic"
                        style={{ color: 'var(--accent)' }}
                    >
                        “
                    </span>
                    {question.body}
                    <span
                        aria-hidden="true"
                        className="ml-1 italic"
                        style={{ color: 'var(--accent)' }}
                    >
                        ”
                    </span>
                </p>

                {/* Footer meta: team / list. */}
                <div className="overlay-editorial__meta flex items-center justify-between font-mono text-[10px] tracking-[0.32em] uppercase opacity-70">
                    <span>
                        {t('overlay.eyebrow.live', { name: team.name })}
                    </span>
                    {list ? (
                        <span className="flex items-center gap-2">
                            <span
                                aria-hidden="true"
                                className="inline-block h-1 w-6"
                                style={{
                                    background:
                                        question.list?.color ?? 'var(--accent)',
                                }}
                            />
                            {list}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
