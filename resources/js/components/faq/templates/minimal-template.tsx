import { ArrowDown, Sparkles } from 'lucide-react';
import { FaqEmptyState } from '@/components/faq/faq-empty-state';
import { QuestionCard } from '@/components/faq/question-card';
import type { FaqQuestion } from '@/components/faq/question-card';
import { QuestionForm } from '@/components/faq/question-form';
import {
    TemplateFooter,
    TemplateGrain,
    TemplateSlug,
} from '@/components/faq/templates/template-frame';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Props = {
    team: {
        name: string;
        slug: string;
        headline?: string | null;
        tagline?: string | null;
    };
    questions: FaqQuestion[];
};

/**
 * The cover. Magazine-style masthead with serif-period signature, asymmetric
 * 12-column hero/form split, single-column reading flow underneath. This is
 * the original editorial direction the rest of the app riffs on.
 */
export function MinimalTemplate({ team, questions }: Props) {
    const { t } = useTranslate();
    const answered = questions.filter(
        (question) => question.status === 'answered',
    );
    const pending = questions.filter(
        (question) => question.status === 'approved',
    );
    const totalCount = questions.length;
    const answeredCount = answered.length;
    const initial = team.name.charAt(0).toUpperCase() || 'Q';

    return (
        <div className="relative min-h-screen">
            <TemplateGrain withGlow />

            <header className="relative z-10 px-5 pt-8 sm:px-8 sm:pt-12 lg:px-12">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <TemplateSlug label={t('faq.minimal.eyebrow')} accent />
                    <div className="hidden font-mono text-[10px] tracking-[0.28em] text-[color:var(--page-muted)] uppercase sm:block">
                        {team.slug}
                    </div>
                </div>
            </header>

            <main className="relative z-10 px-5 pt-10 pb-20 sm:px-8 sm:pt-14 lg:px-12 lg:pt-20">
                <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-10">
                    <section className="lg:col-span-7">
                        <MinimalHero
                            teamName={team.name}
                            headline={team.headline}
                            tagline={team.tagline}
                            initial={initial}
                            totalCount={totalCount}
                            answeredCount={answeredCount}
                        />
                    </section>

                    <section className="lg:col-span-5">
                        <QuestionForm
                            teamSlug={team.slug}
                            teamName={team.name}
                        />
                    </section>
                </div>

                <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
                    {totalCount === 0 ? (
                        <FaqEmptyState teamName={team.name} />
                    ) : (
                        <div className="space-y-14">
                            {answered.length > 0 ? (
                                <MinimalQuestionGroup
                                    eyebrow={t('faq.minimal.answered_eyebrow')}
                                    title={t('faq.minimal.answered_title')}
                                    description={t(
                                        'faq.minimal.answered_description',
                                    )}
                                    count={answered.length}
                                    questions={answered}
                                    startIndex={1}
                                    accentDot
                                />
                            ) : null}

                            {pending.length > 0 ? (
                                <MinimalQuestionGroup
                                    eyebrow={t('faq.minimal.pending_eyebrow')}
                                    title={t('faq.minimal.pending_title')}
                                    description={t(
                                        'faq.minimal.pending_description',
                                    )}
                                    count={pending.length}
                                    questions={pending}
                                    startIndex={answered.length + 1}
                                />
                            ) : null}
                        </div>
                    )}
                </div>
            </main>

            <TemplateFooter teamName={team.name} teamSlug={team.slug} />
        </div>
    );
}

function MinimalHero({
    teamName,
    headline,
    tagline,
    initial,
    totalCount,
    answeredCount,
}: {
    teamName: string;
    headline?: string | null;
    tagline?: string | null;
    initial: string;
    totalCount: number;
    answeredCount: number;
}) {
    const { t } = useTranslate();
    const displayHeadline = headline?.trim() || teamName;
    const issueNumber = String(Math.max(totalCount, 1)).padStart(3, '0');

    return (
        <div className="relative">
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.32em] text-[color:var(--page-muted)] uppercase">
                <span
                    aria-hidden="true"
                    className="h-px w-8 bg-[color:var(--page-ink)]/30"
                />
                {t('faq.minimal.issue', { number: issueNumber })}
                <span
                    aria-hidden="true"
                    className="text-[color:var(--page-rule)]"
                >
                    &middot;
                </span>
                <span>{new Date().getFullYear()}</span>
            </div>

            <div className="relative mt-5 flex items-start gap-4 sm:gap-5">
                <span
                    aria-hidden="true"
                    className={cn(
                        'font-display shrink-0 text-[5rem] leading-[0.85] font-medium italic select-none',
                        'text-[var(--accent-ink)]',
                        'sm:text-[7rem] lg:text-[8.5rem]',
                    )}
                    style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144' }}
                >
                    {initial}
                    <span className="text-[color:var(--page-ink)]/85">.</span>
                </span>

                <div className="pt-1.5 sm:pt-3">
                    <p className="font-mono text-[10px] tracking-[0.32em] text-[color:var(--page-muted)] uppercase">
                        {t('faq.minimal.ask')}
                    </p>
                    <h1
                        className={cn(
                            'font-display mt-1 text-4xl leading-[1.02] font-semibold tracking-tight text-balance',
                            'text-[color:var(--page-ink)]',
                            'sm:text-6xl lg:text-7xl',
                        )}
                    >
                        {displayHeadline}
                        <span className="text-[var(--accent-ink)]">.</span>
                    </h1>
                </div>
            </div>

            <p className="font-display mt-7 max-w-xl text-lg leading-relaxed text-[color:var(--page-ink)]/80 sm:text-xl">
                {tagline?.trim() ? (
                    tagline
                ) : (
                    <>
                        {t('faq.minimal.tagline_part_one')}{' '}
                        <span className="text-[color:var(--page-ink)]">
                            {t('faq.minimal.tagline_part_two')}
                        </span>{' '}
                        {t('faq.minimal.tagline_part_three')}
                    </>
                )}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                    href="#ask"
                    className={cn(
                        'group inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 py-3 text-sm font-medium',
                        'bg-[color:var(--page-ink)] text-[color:var(--page-bg)]',
                        'transition-transform hover:-translate-y-0.5',
                    )}
                >
                    <Sparkles
                        className="size-4 transition-transform group-hover:rotate-12"
                        aria-hidden="true"
                    />
                    {t('faq.minimal.cta_ask')}
                    <ArrowDown
                        className="size-4 transition-transform group-hover:translate-y-0.5"
                        aria-hidden="true"
                    />
                </a>

                <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.22em] text-[color:var(--page-muted)] uppercase">
                    <Stat
                        label={t('faq.minimal.stat_questions')}
                        value={totalCount}
                    />
                    <span
                        aria-hidden="true"
                        className="text-[color:var(--page-rule)]"
                    >
                        /
                    </span>
                    <Stat
                        label={t('faq.minimal.stat_answered')}
                        value={answeredCount}
                    />
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="font-display text-base font-semibold text-[color:var(--page-ink)] not-italic tabular-nums">
                {value.toString().padStart(2, '0')}
            </span>
            <span>{label}</span>
        </span>
    );
}

function MinimalQuestionGroup({
    eyebrow,
    title,
    description,
    count,
    questions,
    startIndex,
    accentDot = false,
}: {
    eyebrow: string;
    title: string;
    description: string;
    count: number;
    questions: FaqQuestion[];
    startIndex: number;
    accentDot?: boolean;
}) {
    return (
        <section>
            <header className="mb-6 flex flex-col gap-1 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div>
                    <TemplateSlug
                        label={eyebrow}
                        accent={accentDot}
                        count={count}
                    />
                    <h2 className="font-display mt-2 text-2xl leading-tight font-semibold text-[color:var(--page-ink)] sm:text-3xl">
                        {title}
                    </h2>
                </div>
                <p className="max-w-xs text-sm text-[color:var(--page-muted)]">
                    {description}
                </p>
            </header>

            <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                {questions.map((question, idx) => (
                    <QuestionCard
                        key={question.id}
                        question={question}
                        index={startIndex + idx}
                    />
                ))}
            </div>
        </section>
    );
}
