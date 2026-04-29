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

function timestampOf(question: FaqQuestion): string {
    return question.status === 'answered' && question.answeredAt
        ? question.answeredAt
        : question.createdAt;
}

/**
 * The archive. A single vertical hairline carries the year of conversation
 * down the page; each entry sits as a serif body anchored by a small saffron
 * disc on the rule, with the date printed in mono on the opposite side. The
 * form rides at the very top in a banner — drop a question, it joins the
 * record below.
 *
 * Answered questions are sorted newest-first by `answeredAt`. Pending ones
 * surface above the archive under a "Pending answers" eyebrow.
 */
export function TimelineTemplate({ team, questions }: Props) {
    const { t } = useTranslate();
    const answered = questions
        .filter((q) => q.status === 'answered')
        .slice()
        .sort((a, b) => {
            const aTs = a.answeredAt ?? a.createdAt;
            const bTs = b.answeredAt ?? b.createdAt;

            return new Date(bTs).getTime() - new Date(aTs).getTime();
        });
    const pending = questions.filter((q) => q.status === 'approved');

    const totalCount = questions.length;
    const initial = team.name.charAt(0).toUpperCase() || 'Q';
    const displayHeadline = team.headline?.trim() || team.name;
    const tagline = team.tagline?.trim() || null;

    return (
        <div className="relative min-h-screen">
            <TemplateGrain />

            <header className="relative z-10 px-5 pt-8 sm:px-8 sm:pt-12 lg:px-12">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <TemplateSlug label={t('faq.timeline.eyebrow')} accent />
                    <div className="hidden font-mono text-[10px] tracking-[0.28em] text-[color:var(--page-muted)] uppercase sm:block">
                        {t('faq.timeline.entry_log', { slug: team.slug })}
                    </div>
                </div>
            </header>

            <main className="relative z-10 px-5 pt-10 pb-20 sm:px-8 lg:px-12">
                {/* Tight masthead — the archive doesn't need a cover. */}
                <section className="mx-auto max-w-5xl">
                    <div className="grid gap-3 border-b border-[color:var(--page-rule)] pb-8 sm:grid-cols-[auto_1fr] sm:items-baseline sm:gap-6">
                        <p className="font-mono text-[10px] tracking-[0.32em] text-[color:var(--page-muted)] uppercase sm:pt-2">
                            <span className="text-[var(--accent-ink)]">
                                &mdash;
                            </span>{' '}
                            {t('faq.timeline.masthead_prefix', {
                                name: team.name,
                            })}
                        </p>
                        <div>
                            <h1 className="font-display text-3xl leading-[1.05] font-semibold tracking-tight text-balance text-[color:var(--page-ink)] sm:text-5xl">
                                {team.headline?.trim() ? (
                                    <>
                                        {displayHeadline}
                                        <span className="text-[var(--accent-ink)]">
                                            .
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        {t(
                                            'faq.timeline.default_headline_part_one',
                                        )}{' '}
                                        <span className="text-[var(--accent-ink)] italic">
                                            {team.name}
                                        </span>{' '}
                                        {t(
                                            'faq.timeline.default_headline_part_two',
                                        )}
                                        <span className="text-[var(--accent-ink)]">
                                            .
                                        </span>
                                    </>
                                )}
                            </h1>
                            {tagline ? (
                                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[color:var(--page-ink)]/75 sm:text-base">
                                    {tagline}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </section>

                {/* Form banner — full-width, sits above the archive. */}
                <section className="mx-auto mt-10 max-w-5xl">
                    <div className="flex items-center gap-3">
                        <span
                            aria-hidden="true"
                            className="font-display text-3xl leading-[0.85] font-medium text-[var(--accent-ink)] italic select-none"
                        >
                            {initial}
                            <span className="text-[color:var(--page-ink)]/85">
                                .
                            </span>
                        </span>
                        <div className="font-mono text-[10px] tracking-[0.32em] text-[color:var(--page-muted)] uppercase">
                            {t('faq.timeline.add_to_record')}
                        </div>
                        <span
                            aria-hidden="true"
                            className="h-px flex-1 bg-[color:var(--page-rule)]"
                        />
                    </div>

                    <div className="mt-5">
                        <QuestionForm
                            teamSlug={team.slug}
                            teamName={team.name}
                        />
                    </div>
                </section>

                {/* The archive. */}
                <section className="mx-auto mt-16 max-w-5xl">
                    {totalCount === 0 ? (
                        <FaqEmptyState teamName={team.name} />
                    ) : (
                        <div className="space-y-14">
                            {pending.length > 0 ? (
                                <PendingBlock
                                    questions={pending}
                                    startIndex={1}
                                />
                            ) : null}

                            {answered.length > 0 ? (
                                <ArchiveBlock
                                    questions={answered}
                                    startIndex={pending.length + 1}
                                />
                            ) : null}
                        </div>
                    )}
                </section>
            </main>

            <TemplateFooter teamName={team.name} teamSlug={team.slug} />
        </div>
    );
}

function PendingBlock({
    questions,
    startIndex,
}: {
    questions: FaqQuestion[];
    startIndex: number;
}) {
    const { t } = useTranslate();

    return (
        <section>
            <header className="mb-6 flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[color:var(--page-ink)]/30"
                />
                <h2 className="font-display text-xl font-semibold tracking-tight text-[color:var(--page-ink)] sm:text-2xl">
                    {t('faq.timeline.pending_title')}
                </h2>
                <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-[color:var(--page-rule)]"
                />
                <span className="font-mono text-[10px] tracking-[0.22em] text-[color:var(--page-muted)] uppercase tabular-nums">
                    {questions.length.toString().padStart(2, '0')}
                </span>
            </header>

            <ul className="space-y-3">
                {questions.map((question, idx) => {
                    const author =
                        question.authorName?.trim() || t('faq.card.anonymous');

                    return (
                        <li
                            key={question.id}
                            className={cn(
                                'group relative flex flex-col gap-2 rounded-xl border border-dashed',
                                'border-[color:var(--page-rule)] bg-[color:var(--page-surface)] p-4 sm:p-5',
                            )}
                        >
                            <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.22em] text-[color:var(--page-muted)] uppercase">
                                <span className="tabular-nums">
                                    N&deg;
                                    {(startIndex + idx)
                                        .toString()
                                        .padStart(3, '0')}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Hourglass
                                        className="size-2.5"
                                        aria-hidden="true"
                                    />
                                    {t('faq.timeline.awaiting')}
                                </span>
                            </div>
                            <p className="font-display text-base leading-snug text-balance text-[color:var(--page-ink)] sm:text-lg">
                                {question.body}
                            </p>
                            <p className="text-xs text-[color:var(--page-muted)]">
                                {t('faq.timeline.asked_by_prefix')}{' '}
                                <span className="text-[color:var(--page-ink)]/80">
                                    {author}
                                </span>
                            </p>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

function ArchiveBlock({
    questions,
    startIndex,
}: {
    questions: FaqQuestion[];
    startIndex: number;
}) {
    const { t } = useTranslate();

    return (
        <section>
            <header className="mb-6 flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[var(--accent-ink)]"
                />
                <h2 className="font-display text-xl font-semibold tracking-tight text-[color:var(--page-ink)] sm:text-2xl">
                    {t('faq.timeline.on_record_title')}
                </h2>
                <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-[color:var(--page-rule)]"
                />
                <span className="font-mono text-[10px] tracking-[0.22em] text-[color:var(--page-muted)] uppercase tabular-nums">
                    {questions.length.toString().padStart(2, '0')}
                </span>
            </header>

            {/* Vertical hairline rule + offset entries. */}
            <ol className="relative ml-3 space-y-10 border-l border-[color:var(--page-rule)] pl-7 sm:ml-6 sm:pl-12">
                {questions.map((question, idx) => (
                    <ArchiveEntry
                        key={question.id}
                        question={question}
                        index={startIndex + idx}
                    />
                ))}
            </ol>
        </section>
    );
}

function ArchiveEntry({
    question,
    index,
}: {
    question: FaqQuestion;
    index: number;
}) {
    const { locale, t } = useTranslate();
    const author = question.authorName?.trim() || t('faq.card.anonymous');
    const ts = timestampOf(question);
    const date = new Date(ts);
    const dateFormatter = makeDateFormatter(locale);
    const dateFormatterShort = makeDateFormatterShort(locale);
    const fullDate = dateFormatter.format(date);
    const shortDate = dateFormatterShort.format(date);

    return (
        <li className="relative">
            {/* Disc on the rule. */}
            <span
                aria-hidden="true"
                className={cn(
                    'absolute top-2 size-2.5 rounded-full ring-4',
                    'left-[-2.06rem] sm:left-[-3.31rem]',
                    'bg-[var(--accent-ink)]',
                )}
                style={{ boxShadow: '0 0 0 4px var(--page-bg)' }}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6">
                {/* Date label printed on the rule. */}
                <div className="shrink-0 sm:w-32">
                    <time
                        dateTime={ts}
                        className="font-mono text-[10px] tracking-[0.22em] text-[color:var(--page-muted)] uppercase"
                    >
                        <span className="hidden sm:inline">{fullDate}</span>
                        <span className="inline sm:hidden">{shortDate}</span>
                    </time>
                    <div className="mt-1 font-mono text-[9px] tracking-[0.22em] text-[color:var(--page-muted)]/70 uppercase tabular-nums">
                        N&deg;{index.toString().padStart(3, '0')}
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <p className="font-display text-lg leading-snug text-balance text-[color:var(--page-ink)] sm:text-xl">
                        <span
                            aria-hidden="true"
                            className="mr-1 text-[var(--accent-ink)]/70"
                        >
                            &ldquo;
                        </span>
                        {question.body}
                        <span
                            aria-hidden="true"
                            className="ml-0.5 text-[var(--accent-ink)]/70"
                        >
                            &rdquo;
                        </span>
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[color:var(--page-muted)]">
                        <span>
                            {t('faq.timeline.asked_by_prefix')}{' '}
                            <span className="font-medium text-[color:var(--page-ink)]/85">
                                {author}
                            </span>
                        </span>

                        {question.answerSource ? (
                            <a
                                href={question.answerSource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    'group/link inline-flex items-center gap-1.5 rounded-full',
                                    'border border-[color:var(--page-border)] bg-[color:var(--page-surface)] px-3 py-1',
                                    'text-[color:var(--page-ink)]/85 transition-colors',
                                    'hover:border-[var(--accent-ink)]/40 hover:bg-[var(--accent-ink)]/10 hover:text-[var(--accent-ink)]',
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
                    </div>
                </div>
            </div>
        </li>
    );
}

function makeDateFormatter(locale: LocaleCode): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}

function makeDateFormatterShort(locale: LocaleCode): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(locale, {
        month: 'short',
        day: '2-digit',
    });
}
