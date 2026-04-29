import { Head, Link, setLayoutProps, usePage } from '@inertiajs/react';
import { ArrowUpRight, Inbox, Lock } from 'lucide-react';
import { useState } from 'react';
import {
    DeskGrain,
    DeskSlug,
    DeskStyleVariables,
} from '@/components/questions/desk-chrome';
import { PendingQuestionCard } from '@/components/questions/pending-question-card';
import type { PendingQuestion } from '@/components/questions/pending-question-card';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { board, inbox } from '@/routes/questions';

type InboxProps = {
    team: { name: string; slug: string };
    pendingQuestions: PendingQuestion[];
    permissions: { canModerate: boolean };
};

export default function QuestionsInbox({
    team,
    pendingQuestions,
    permissions,
}: InboxProps) {
    const { t } = useTranslate();
    const currentTeam = usePage().props.currentTeam;

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('questions.inbox.breadcrumb'),
                href: currentTeam ? inbox(currentTeam.slug).url : '#',
            },
        ],
    });

    const [resolvedIds, setResolvedIds] = useState<Set<number>>(
        () => new Set(),
    );

    const visible = pendingQuestions.filter((q) => !resolvedIds.has(q.id));
    const handleResolved = (id: number) => {
        setResolvedIds((prev) => {
            const next = new Set(prev);
            next.add(id);

            return next;
        });
    };

    return (
        <>
            <Head title={t('questions.inbox.title', { team: team.name })}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="desk-root relative isolate min-h-[calc(100vh-4rem)] bg-[var(--page-bg)] text-foreground antialiased">
                <DeskStyleVariables />
                <DeskGrain />

                <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pt-8 pb-24 sm:px-8 sm:pt-12 lg:px-10">
                    <Masthead team={team} count={visible.length} />

                    <div
                        aria-hidden="true"
                        className="desk-rule mt-8 h-px w-full"
                    />

                    {!permissions.canModerate ? (
                        <LockedState />
                    ) : visible.length === 0 ? (
                        <InboxZeroState />
                    ) : (
                        <ol className="mt-8 space-y-4 sm:mt-10 sm:space-y-5">
                            {visible.map((question, idx) => (
                                <li key={question.id}>
                                    <PendingQuestionCard
                                        question={question}
                                        index={idx + 1}
                                        canModerate={permissions.canModerate}
                                        onResolved={handleResolved}
                                    />
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </>
    );
}

function Masthead({
    team,
    count,
}: {
    team: { name: string; slug: string };
    count: number;
}) {
    const { t } = useTranslate();

    return (
        <header className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <DeskSlug label={t('questions.inbox.slug_label')} accent />
                <Link
                    href={board(team.slug).url}
                    className={cn(
                        'group inline-flex min-h-[36px] items-center gap-1.5 rounded-full',
                        'border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-foreground/75 uppercase',
                        'transition-[border-color,background-color] hover:border-foreground/50 hover:bg-card',
                    )}
                >
                    {t('questions.inbox.to_the_desk')}
                    <ArrowUpRight
                        className="size-3 transition-transform group-hover:translate-x-px group-hover:-translate-y-px"
                        aria-hidden="true"
                    />
                </Link>
            </div>

            <div className="grid items-end gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-10">
                <div>
                    <p className="font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                        {t('questions.inbox.edition_label', {
                            slug: team.slug,
                        })}
                    </p>
                    <h1
                        className={cn(
                            'font-display mt-2 text-4xl leading-[1.04] font-semibold tracking-tight text-balance text-foreground',
                            'sm:text-5xl lg:text-6xl',
                        )}
                    >
                        {t('questions.inbox.masthead_title_main')}
                        <span className="text-[var(--accent-ink)]">.</span>
                        <br />
                        <span className="text-foreground/65 italic">
                            {t('questions.inbox.masthead_title_subtitle')}
                        </span>
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                        {t('questions.inbox.description')}
                    </p>
                </div>

                <CountStamp count={count} />
            </div>
        </header>
    );
}

function CountStamp({ count }: { count: number }) {
    const { t } = useTranslate();

    return (
        <div className="relative shrink-0">
            <div
                aria-hidden="true"
                className="absolute -inset-3 -rotate-2 rounded-2xl border border-dashed border-[color:var(--stamp-ink)]/30"
            />
            <div className="relative flex flex-col items-center rounded-xl border border-[color:var(--stamp-ink)]/40 bg-[var(--stamp-ink)]/[0.06] px-5 py-4 text-center">
                <span className="font-mono text-[9px] tracking-[0.32em] text-[color:var(--stamp-ink)] uppercase">
                    {t('questions.inbox.count_stamp_label')}
                </span>
                <span className="font-display mt-1 text-5xl leading-none font-semibold text-[color:var(--stamp-ink)] tabular-nums">
                    {count.toString().padStart(2, '0')}
                </span>
                <span className="mt-1 font-mono text-[9px] tracking-[0.22em] text-[color:var(--stamp-ink)]/70 uppercase">
                    {count === 1
                        ? t('questions.inbox.count_stamp_question_singular')
                        : t('questions.inbox.count_stamp_question_plural')}
                </span>
            </div>
        </div>
    );
}

function InboxZeroState() {
    const { t } = useTranslate();

    return (
        <div className="relative mt-12 overflow-hidden rounded-3xl border border-dashed border-border/80 bg-card/40 px-6 py-16 text-center">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_1px_1px,_var(--border)_1px,_transparent_0)] [background-size:20px_20px] opacity-50"
            />
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--accent-ink)]/10 text-[var(--accent-ink)]">
                <Inbox className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                {t('questions.inbox.zero_eyebrow')}
            </p>
            <h2 className="font-display mx-auto mt-3 max-w-md text-2xl leading-snug text-balance text-foreground sm:text-3xl">
                {t('questions.inbox.zero_title')}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                {t('questions.inbox.zero_description')}
            </p>
        </div>
    );
}

function LockedState() {
    const { t } = useTranslate();

    return (
        <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed border-border/80 bg-card/40 px-6 py-16 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-foreground/5 text-foreground/60">
                <Lock className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-mono text-[10px] tracking-[0.32em] text-foreground/60 uppercase">
                {t('questions.inbox.locked_eyebrow')}
            </p>
            <h2 className="font-display mx-auto mt-3 max-w-md text-2xl leading-snug text-foreground sm:text-3xl">
                {t('questions.inbox.locked_title')}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                {t('questions.inbox.locked_description')}
            </p>
        </div>
    );
}
