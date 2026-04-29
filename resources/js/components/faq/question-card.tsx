import { ArrowUpRight, Hourglass } from 'lucide-react';
import { PlatformIcon } from '@/components/faq/platform-icon';
import type { FaqPlatform } from '@/components/faq/platform-icon';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { LocaleCode } from '@/types/global';

export type FaqQuestion = {
    id: number;
    body: string;
    authorName: string | null;
    status: 'approved' | 'answered';
    answerSource: {
        url: string;
        label: string | null;
        platform: FaqPlatform;
    } | null;
    list: { name: string; color: string | null } | null;
    answeredAt: string | null;
    createdAt: string;
};

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
    { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: 'day', ms: 1000 * 60 * 60 * 24 },
    { unit: 'hour', ms: 1000 * 60 * 60 },
    { unit: 'minute', ms: 1000 * 60 },
];

function formatRelative(
    iso: string,
    locale: LocaleCode,
    justNowLabel: string,
): string {
    const formatter = new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
    });
    const diffMs = new Date(iso).getTime() - Date.now();
    const absMs = Math.abs(diffMs);

    if (absMs < 60_000) {
        return justNowLabel;
    }

    for (const { unit, ms } of RELATIVE_UNITS) {
        if (absMs >= ms) {
            const value = Math.round(diffMs / ms);

            return formatter.format(value, unit);
        }
    }

    return formatter.format(Math.round(diffMs / 60_000), 'minute');
}

function formatIndex(index: number): string {
    return index.toString().padStart(3, '0');
}

type Props = {
    question: FaqQuestion;
    index: number;
};

export function QuestionCard({ question, index }: Props) {
    const { locale, t } = useTranslate();
    const isAnswered = question.status === 'answered';
    const accent = question.list?.color ?? null;
    const author = question.authorName?.trim() || t('faq.card.anonymous');
    const timestamp =
        isAnswered && question.answeredAt
            ? question.answeredAt
            : question.createdAt;

    return (
        <article
            className={cn(
                'group relative isolate flex flex-col gap-5 overflow-hidden',
                'rounded-2xl border border-border/70 bg-card/80 p-5 backdrop-blur-sm',
                'shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_-32px_rgba(15,12,8,0.35)]',
                'transition-[transform,box-shadow,border-color] duration-300',
                'hover:-translate-y-0.5 hover:border-border hover:shadow-[0_1px_0_rgba(0,0,0,0.03),0_28px_60px_-30px_rgba(15,12,8,0.5)]',
                'sm:p-6',
            )}
        >
            {accent ? (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-4 left-0 w-[3px] rounded-r-full"
                    style={{ backgroundColor: accent }}
                />
            ) : null}

            <header className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                    <span className="tabular-nums">
                        N&deg;{formatIndex(index)}
                    </span>
                    {question.list?.name ? (
                        <>
                            <span aria-hidden="true" className="text-border">
                                /
                            </span>
                            <span className="truncate text-foreground/70">
                                {question.list.name}
                            </span>
                        </>
                    ) : null}
                </div>

                {isAnswered ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--accent-ink)]/20 bg-[var(--accent-ink)]/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.22em] text-[var(--accent-ink)] uppercase">
                        <span className="h-1 w-1 rounded-full bg-[var(--accent-ink)]" />
                        {t('faq.card.answered')}
                    </span>
                ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 font-mono text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
                        <Hourglass className="size-2.5" aria-hidden="true" />
                        {t('faq.card.on_the_list')}
                    </span>
                )}
            </header>

            <p className="font-display text-lg leading-snug text-balance text-foreground sm:text-xl">
                <span
                    aria-hidden="true"
                    className="mr-1.5 text-[var(--accent-ink)]/80"
                >
                    &ldquo;
                </span>
                {question.body}
                <span
                    aria-hidden="true"
                    className="ml-0.5 text-[var(--accent-ink)]/80"
                >
                    &rdquo;
                </span>
            </p>

            <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border/70 pt-4 text-xs text-muted-foreground">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="font-display inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-[11px] font-medium text-foreground/80">
                        {author.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">
                        <span className="font-medium text-foreground/80">
                            {author}
                        </span>
                        <span aria-hidden="true" className="mx-1.5 text-border">
                            &middot;
                        </span>
                        <time dateTime={timestamp}>
                            {formatRelative(
                                timestamp,
                                locale,
                                t('faq.card.just_now'),
                            )}
                        </time>
                    </span>
                </div>

                {isAnswered && question.answerSource ? (
                    <a
                        href={question.answerSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'group/link inline-flex min-h-[36px] items-center gap-1.5 rounded-full',
                            'border border-foreground/10 bg-foreground/[0.04] px-3 py-1.5 text-xs font-medium text-foreground',
                            'transition-colors hover:border-[var(--accent-ink)]/40 hover:bg-[var(--accent-ink)]/10 hover:text-[var(--accent-ink)]',
                        )}
                    >
                        <PlatformIcon
                            platform={question.answerSource.platform}
                            className="size-3.5"
                        />
                        <span>
                            {question.answerSource.label ??
                                t('faq.card.answered_on', {
                                    platform: t(
                                        `faq.platforms.${question.answerSource.platform}`,
                                    ),
                                })}
                        </span>
                        <ArrowUpRight
                            className="size-3 transition-transform group-hover/link:translate-x-px group-hover/link:-translate-y-px"
                            aria-hidden="true"
                        />
                    </a>
                ) : null}
            </footer>
        </article>
    );
}
