import { ArrowUpRight, Hourglass } from 'lucide-react';
import { FaqEmptyState } from '@/components/faq/faq-empty-state';
import { PlatformIcon } from '@/components/faq/platform-icon';
import type { FaqQuestion } from '@/components/faq/question-card';
import { QuestionForm } from '@/components/faq/question-form';
import {
    TemplateFooter,
    TemplateGrain,
    TemplateSlug,
} from '@/components/faq/templates/template-frame';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { LocaleCode } from '@/types/global';

type Props = {
    team: {
        name: string;
        slug: string;
        headline?: string | null;
        tagline?: string | null;
    };
    questions: FaqQuestion[];
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
            return formatter.format(Math.round(diffMs / ms), unit);
        }
    }

    return formatter.format(Math.round(diffMs / 60_000), 'minute');
}

/**
 * The contact sheet. A graphic, denser variant: questions live in a 2/3-up
 * card matrix, the form is a sticky sidebar at `lg:` so the masthead never
 * scrolls out of reach. Cards are flatter, more square, with bigger platform
 * badges and an accent rule across the top — the magazine's interior spread.
 */
export function GridTemplate({ team, questions }: Props) {
    const { t } = useTranslate();
    const answered = questions.filter((q) => q.status === 'answered');
    const pending = questions.filter((q) => q.status === 'approved');
    const totalCount = questions.length;
    const initial = team.name.charAt(0).toUpperCase() || 'Q';
    const displayHeadline = team.headline?.trim() || team.name;
    const tagline = team.tagline?.trim() || null;
    const volume = String(Math.max(totalCount, 1)).padStart(2, '0');

    return (
        <div className="relative min-h-screen">
            <TemplateGrain />

            <header className="relative z-10 px-5 pt-8 sm:px-8 sm:pt-12 lg:px-12">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <TemplateSlug label={t('faq.grid.eyebrow')} accent />
                    <div className="hidden font-mono text-[10px] tracking-[0.28em] text-[color:var(--page-muted)] uppercase sm:block">
                        {t('faq.grid.masthead_volume', {
                            volume,
                            slug: team.slug,
                        })}
                    </div>
                </div>
            </header>

            <main className="relative z-10 px-5 pt-10 pb-20 sm:px-8 lg:px-12">
                {/* Compact masthead — wide, low, type-driven. */}
                <section className="mx-auto max-w-6xl">
                    <div className="flex items-end gap-5 border-b border-[color:var(--page-rule)] pb-6">
                        <span
                            aria-hidden="true"
                            className="font-display shrink-0 text-[3.5rem] leading-[0.85] font-medium text-[var(--accent-ink)] italic select-none sm:text-[4.5rem]"
                            style={{
                                fontVariationSettings: '"SOFT" 100, "opsz" 144',
                            }}
                        >
                            {initial}
                            <span className="text-[color:var(--page-ink)]/85">
                                .
                            </span>
                        </span>
                        <div className="min-w-0 flex-1 pb-2">
                            <p className="font-mono text-[10px] tracking-[0.32em] text-[color:var(--page-muted)] uppercase">
                                Asked
                                <span className="text-[var(--accent-ink)]">
                                    .
                                </span>{' '}
                                / {t('faq.grid.interior')}
                            </p>
                            <h1 className="font-display mt-1 text-3xl leading-[1.05] font-semibold tracking-tight text-balance text-[color:var(--page-ink)] sm:text-5xl lg:text-6xl">
                                {displayHeadline}
                                <span className="text-[var(--accent-ink)]">
                                    .
                                </span>
                            </h1>
                            {tagline ? (
                                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--page-ink)]/75 sm:text-base">
                                    {tagline}
                                </p>
                            ) : null}
                        </div>
                        <div className="hidden shrink-0 pb-2 text-right font-mono text-[10px] tracking-[0.22em] text-[color:var(--page-muted)] uppercase sm:block">
                            <div>
                                {t('faq.grid.total', {
                                    count: totalCount
                                        .toString()
                                        .padStart(2, '0'),
                                })}
                            </div>
                            <div className="mt-1">
                                {t('faq.grid.live', {
                                    count: answered.length
                                        .toString()
                                        .padStart(2, '0'),
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-12 lg:gap-12">
                    {/* Question grid — 1/2/3 columns. */}
                    <section className="lg:col-span-8">
                        {totalCount === 0 ? (
                            <FaqEmptyState teamName={team.name} />
                        ) : (
                            <div className="space-y-12">
                                {answered.length > 0 ? (
                                    <GridGroup
                                        eyebrow={t('faq.grid.answered_eyebrow')}
                                        count={answered.length}
                                        questions={answered}
                                        startIndex={1}
                                    />
                                ) : null}
                                {pending.length > 0 ? (
                                    <GridGroup
                                        eyebrow={t('faq.grid.pending_eyebrow')}
                                        count={pending.length}
                                        questions={pending}
                                        startIndex={answered.length + 1}
                                        muted
                                    />
                                ) : null}
                            </div>
                        )}
                    </section>

                    {/* Sticky form rail at `lg:`, stacks above on mobile. */}
                    <aside className="lg:col-span-4">
                        <div className="lg:sticky lg:top-8">
                            <QuestionForm
                                teamSlug={team.slug}
                                teamName={team.name}
                            />
                        </div>
                    </aside>
                </div>
            </main>

            <TemplateFooter teamName={team.name} teamSlug={team.slug} />
        </div>
    );
}

function GridGroup({
    eyebrow,
    count,
    questions,
    startIndex,
    muted = false,
}: {
    eyebrow: string;
    count: number;
    questions: FaqQuestion[];
    startIndex: number;
    muted?: boolean;
}) {
    return (
        <section>
            <header className="mb-5 flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className={cn(
                        'h-2 w-2 rounded-full',
                        muted
                            ? 'bg-[color:var(--page-ink)]/30'
                            : 'bg-[var(--accent-ink)]',
                    )}
                />
                <h2 className="font-display text-xl font-semibold tracking-tight text-[color:var(--page-ink)] sm:text-2xl">
                    {eyebrow}
                </h2>
                <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-[color:var(--page-rule)]"
                />
                <span className="font-mono text-[10px] tracking-[0.22em] text-[color:var(--page-muted)] uppercase tabular-nums">
                    {count.toString().padStart(2, '0')}
                </span>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                {questions.map((question, idx) => (
                    <GridQuestionCard
                        key={question.id}
                        question={question}
                        index={startIndex + idx}
                    />
                ))}
            </div>
        </section>
    );
}

/**
 * Grid-style card. Squarer aspect than the minimal one, with a bold accent
 * top-rule and a large platform badge. Reads well in the contact-sheet matrix.
 */
function GridQuestionCard({
    question,
    index,
}: {
    question: FaqQuestion;
    index: number;
}) {
    const { locale, t } = useTranslate();
    const isAnswered = question.status === 'answered';
    const author = question.authorName?.trim() || t('faq.card.anonymous');
    const timestamp =
        isAnswered && question.answeredAt
            ? question.answeredAt
            : question.createdAt;
    const accent = question.list?.color ?? null;

    return (
        <article
            className={cn(
                'group relative isolate flex flex-col gap-4 overflow-hidden rounded-xl',
                'border border-[color:var(--page-border)] bg-[color:var(--page-surface)] p-5 backdrop-blur-sm',
                'transition-[transform,border-color] duration-300',
                'hover:-translate-y-0.5 hover:border-[var(--accent-ink)]/40',
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-[3px]',
                    isAnswered
                        ? 'bg-[var(--accent-ink)]'
                        : 'bg-[color:var(--page-rule)]',
                )}
                style={accent ? { backgroundColor: accent } : undefined}
            />

            <header className="flex items-center justify-between gap-3">
                <span className="font-mono text-[9px] tracking-[0.22em] text-[color:var(--page-muted)] uppercase tabular-nums">
                    N&deg;{index.toString().padStart(3, '0')}
                </span>

                {isAnswered ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-ink)]/30 bg-[var(--accent-ink)]/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.22em] text-[var(--accent-ink)] uppercase">
                        <span className="h-1 w-1 rounded-full bg-[var(--accent-ink)]" />
                        {t('faq.grid.badge_live')}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--page-border)] px-2 py-0.5 font-mono text-[9px] tracking-[0.22em] text-[color:var(--page-muted)] uppercase">
                        <Hourglass className="size-2.5" aria-hidden="true" />
                        {t('faq.grid.badge_queue')}
                    </span>
                )}
            </header>

            <p className="font-display text-base leading-snug text-balance text-[color:var(--page-ink)] sm:text-lg">
                {question.body}
            </p>

            <footer className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-[color:var(--page-rule)] pt-3 text-xs">
                <div className="flex min-w-0 items-center gap-2 text-[color:var(--page-muted)]">
                    <span className="font-display inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--page-ink)]/[0.06] text-[10px] font-medium text-[color:var(--page-ink)]/80">
                        {author.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">
                        <span className="font-medium text-[color:var(--page-ink)]/80">
                            {author}
                        </span>
                        <span
                            aria-hidden="true"
                            className="mx-1.5 text-[color:var(--page-rule)]"
                        >
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
                        aria-label={
                            question.answerSource.label ??
                            t('faq.card.answered_on', {
                                platform: t(
                                    `faq.platforms.${question.answerSource.platform}`,
                                ),
                            })
                        }
                        className={cn(
                            'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
                            'border border-[color:var(--page-border)] bg-[color:var(--page-ink)]/[0.04] text-[color:var(--page-ink)]',
                            'transition-colors hover:border-[var(--accent-ink)]/50 hover:bg-[var(--accent-ink)]/10 hover:text-[var(--accent-ink)]',
                        )}
                    >
                        <PlatformIcon
                            platform={question.answerSource.platform}
                            className="size-3.5"
                        />
                        <ArrowUpRight
                            className="absolute -top-1 -right-1 size-3 opacity-0 transition-opacity group-hover:opacity-70"
                            aria-hidden="true"
                        />
                    </a>
                ) : null}
            </footer>
        </article>
    );
}
