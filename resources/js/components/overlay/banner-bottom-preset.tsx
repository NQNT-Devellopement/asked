import { useTranslate } from '@/lib/i18n';
import type { PresetProps } from './types';

/**
 * Banner Bottom preset: ticker-style chyron clipped to ~120px tall.
 *
 * Slim full-width strip pinned to the bottom edge. A saffron stripe wipes
 * in along the top edge, then the question text slides in from the right
 * as a single tight serif line. Author + Asked. wordmark sit on the right
 * column. Tuned for streamers who want their game / talking-head mostly
 * unobstructed.
 */
export function BannerBottomPreset({ question, team, phase }: PresetProps) {
    const { t } = useTranslate();
    const author =
        question.authorName?.trim() || t('overlay.eyebrow.anonymous');

    return (
        <div
            className="overlay-banner absolute right-0 bottom-0 left-0"
            data-phase={phase}
            aria-label={t('overlay.aria.live_region')}
        >
            {/* Saffron stripe along the top edge of the banner. */}
            <div
                aria-hidden="true"
                className="overlay-banner__stripe h-[3px] w-full"
                style={{
                    background:
                        'linear-gradient(to right, var(--accent-deep) 0%, var(--accent) 50%, var(--accent-deep) 100%)',
                }}
            />

            <div
                className="relative flex h-[120px] items-stretch"
                style={{
                    background:
                        'linear-gradient(to top, var(--shade-90) 0%, var(--shade-80) 100%)',
                    backdropFilter: 'blur(10px) saturate(110%)',
                    WebkitBackdropFilter: 'blur(10px) saturate(110%)',
                }}
            >
                {/* Eyebrow: vertical mono caps tag. */}
                <div className="overlay-banner__eyebrow flex w-[140px] flex-col justify-center gap-1 border-r border-white/10 pl-8">
                    <span
                        className="font-mono text-[9px] tracking-[0.4em] uppercase"
                        style={{ color: 'var(--accent)' }}
                    >
                        {t('overlay.eyebrow.on_air')}
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.32em] uppercase opacity-60">
                        @{team.slug}
                    </span>
                </div>

                {/* Body: single line, truncated. */}
                <div className="overlay-banner__body flex flex-1 items-center px-8">
                    <p
                        className="font-display truncate text-[clamp(1.4rem,2.1vw,2rem)] leading-tight tracking-[-0.01em]"
                        style={{ color: 'var(--paper)' }}
                    >
                        <span
                            aria-hidden="true"
                            className="mr-1.5 italic"
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
                </div>

                {/* Right rail: author + Asked. wordmark. */}
                <div className="flex w-[200px] flex-col items-end justify-center gap-1 border-l border-white/10 pr-8 text-right">
                    <span
                        className="font-mono text-[9px] tracking-[0.32em] uppercase opacity-60"
                        style={{ color: 'var(--paper)' }}
                    >
                        {t('overlay.eyebrow.from')} · {author}
                    </span>
                    <span
                        className="font-display text-base font-medium tracking-tight"
                        style={{ color: 'var(--accent)' }}
                    >
                        {t('overlay.eyebrow.asked')}
                    </span>
                </div>
            </div>
        </div>
    );
}
