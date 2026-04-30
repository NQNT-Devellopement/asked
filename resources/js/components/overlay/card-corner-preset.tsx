import { useTranslate } from '@/lib/i18n';
import type { PresetProps } from './types';

/**
 * Card Corner preset: floating editorial card pinned bottom-right.
 *
 * A 420×220 saffron-bordered card resting against the bottom-right corner
 * with a -1deg tilt and soft drop shadow — feels like a polaroid pinned to
 * the scene. Question body in serif, author + position metadata in mono
 * caps on a divided footer rail. Slides in from the right with a slight
 * over-rotation.
 */
export function CardCornerPreset({ question, team, phase }: PresetProps) {
    const { t } = useTranslate();
    const author =
        question.authorName?.trim() || t('overlay.eyebrow.anonymous');
    const number = question.position > 0 ? question.position : question.id;

    return (
        <div
            className="overlay-card absolute right-10 bottom-10"
            data-phase={phase}
            aria-label={t('overlay.aria.live_region')}
        >
            <div
                className="relative w-[420px] overflow-hidden"
                style={{
                    minHeight: '220px',
                    background:
                        'linear-gradient(155deg, oklch(0.18 0.012 60 / 0.96) 0%, oklch(0.13 0.01 60 / 0.96) 100%)',
                    border: '1px solid oklch(0.35 0.04 60 / 0.5)',
                    borderRadius: '14px',
                    boxShadow:
                        '0 30px 60px -20px oklch(0 0 0 / 0.55), 0 8px 18px -6px oklch(0 0 0 / 0.35), inset 0 1px 0 oklch(1 0 0 / 0.06)',
                    backdropFilter: 'blur(18px) saturate(130%)',
                    WebkitBackdropFilter: 'blur(18px) saturate(130%)',
                }}
            >
                {/* Saffron L-bracket — top-left corner. */}
                <div
                    aria-hidden="true"
                    className="absolute top-0 left-0 h-12 w-[2px]"
                    style={{ background: 'var(--accent)' }}
                />
                <div
                    aria-hidden="true"
                    className="absolute top-0 left-0 h-[2px] w-12"
                    style={{ background: 'var(--accent)' }}
                />
                {/* Saffron L-bracket — bottom-right corner. */}
                <div
                    aria-hidden="true"
                    className="absolute right-0 bottom-0 h-12 w-[2px]"
                    style={{ background: 'var(--accent)' }}
                />
                <div
                    aria-hidden="true"
                    className="absolute right-0 bottom-0 h-[2px] w-12"
                    style={{ background: 'var(--accent)' }}
                />

                {/* Soft saffron glow behind the card content. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl"
                    style={{ background: 'var(--accent)', opacity: 0.18 }}
                />

                <div className="relative flex h-full flex-col gap-4 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.36em] uppercase">
                            <span
                                className="overlay-card__pulse inline-block h-1.5 w-1.5 rounded-full"
                                style={{ background: 'var(--accent)' }}
                            />
                            <span style={{ color: 'var(--accent)' }}>
                                {t('overlay.eyebrow.on_air')}
                            </span>
                        </div>
                        <span className="font-mono text-[9px] tracking-[0.36em] uppercase opacity-60">
                            #{number.toString().padStart(3, '0')}
                        </span>
                    </div>

                    <p
                        className="font-display line-clamp-4 flex-1 text-[1.6rem] leading-[1.16] tracking-[-0.012em]"
                        style={{ color: 'var(--paper)' }}
                    >
                        {question.body}
                    </p>

                    <div className="flex items-end justify-between border-t border-white/10 pt-3">
                        <div className="flex flex-col">
                            <span className="font-mono text-[9px] tracking-[0.32em] uppercase opacity-50">
                                {t('overlay.eyebrow.from')}
                            </span>
                            <span
                                className="font-display text-sm font-medium tracking-tight"
                                style={{ color: 'var(--paper)' }}
                            >
                                {author}
                            </span>
                        </div>
                        <span
                            className="font-display text-base tracking-tight"
                            style={{ color: 'var(--accent)' }}
                        >
                            {t('overlay.eyebrow.asked')}
                            <span className="opacity-50">/{team.slug}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
