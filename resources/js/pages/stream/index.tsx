import { Head, setLayoutProps, usePage } from '@inertiajs/react';
import { Lock, Plus, Radio } from 'lucide-react';
import { useState } from 'react';
import {
    DeskGrain,
    DeskSlug,
    DeskStyleVariables,
} from '@/components/questions/desk-chrome';
import { SessionComposer } from '@/components/stream/session-composer';
import { SessionRow } from '@/components/stream/session-row';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { index as streamIndex } from '@/routes/stream';
import type {
    StreamPermissions,
    StreamSession,
    StreamSourceList,
} from '@/types/stream';

type IndexProps = {
    team: { name: string; slug: string };
    sessions: StreamSession[];
    permissions: StreamPermissions;
    /**
     * Lists of approved questions the operator can scope a session to.
     * Backend currently doesn't ship this on stream.index, so we fall back
     * to an empty array — the composer still works (defaults to all approved).
     */
    lists?: StreamSourceList[];
};

export default function StreamIndex({
    team,
    sessions,
    permissions,
    lists = [],
}: IndexProps) {
    const { t } = useTranslate();
    const currentTeam = usePage().props.currentTeam;

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('stream.index.breadcrumb'),
                href: currentTeam ? streamIndex(currentTeam.slug).url : '#',
            },
        ],
    });

    const [composerOpen, setComposerOpen] = useState(false);

    // Active sessions float to the top of the list — when the operator is
    // mid-stream, that's the row they want to grab without thinking.
    const orderedSessions = [...sessions].sort((a, b) => {
        const aLive = a.is_active && a.current_question_id !== null ? 1 : 0;
        const bLive = b.is_active && b.current_question_id !== null ? 1 : 0;

        return bLive - aLive;
    });

    const activeCount = sessions.filter(
        (s) => s.is_active && s.current_question_id !== null,
    ).length;

    return (
        <>
            <Head title={t('stream.index.title')}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="desk-root relative isolate min-h-[calc(100vh-4rem)] bg-[var(--page-bg)] text-foreground antialiased">
                <DeskStyleVariables />
                <DeskGrain />

                <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-8 pb-24 sm:px-8 sm:pt-12 lg:px-10">
                    <Masthead team={team} count={activeCount} />

                    <div
                        aria-hidden="true"
                        className="desk-rule mt-8 h-px w-full"
                    />

                    {!permissions.canManage ? (
                        <LockedState />
                    ) : (
                        <div className="mt-8 flex flex-col gap-8">
                            {composerOpen ? (
                                <SessionComposer
                                    teamSlug={team.slug}
                                    lists={lists}
                                    onCancel={() => setComposerOpen(false)}
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setComposerOpen(true)}
                                    className={cn(
                                        'group inline-flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-foreground/25 bg-card/40 px-5 py-5 text-left',
                                        'transition-[border-color,background-color] hover:border-foreground/55 hover:bg-card/70',
                                        'sm:w-auto sm:self-start',
                                    )}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--accent-ink)]/12 text-[var(--accent-ink)]">
                                            <Plus
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="flex flex-col">
                                            <span className="font-mono text-[10px] tracking-[0.28em] text-foreground/55 uppercase">
                                                {t('stream.composer.eyebrow')}
                                            </span>
                                            <span className="font-display mt-0.5 text-lg font-semibold text-foreground">
                                                {t(
                                                    'stream.actions.start_session',
                                                )}
                                            </span>
                                        </span>
                                    </span>
                                </button>
                            )}

                            {sessions.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <section>
                                    <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                                        <DeskSlug
                                            label={t(
                                                'stream.index.sessions_eyebrow',
                                            )}
                                            count={sessions.length}
                                        />
                                        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground sm:max-w-xs">
                                            {t('stream.index.description')}
                                        </p>
                                    </header>

                                    <ol className="mt-3 flex flex-col">
                                        {orderedSessions.map((session) => (
                                            <li key={session.id}>
                                                <SessionRow
                                                    session={session}
                                                    teamSlug={team.slug}
                                                    canManage={
                                                        permissions.canManage
                                                    }
                                                />
                                            </li>
                                        ))}
                                    </ol>
                                </section>
                            )}
                        </div>
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
                <DeskSlug label={t('stream.index.slug_label')} accent />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-card/60 px-3 py-1 font-mono text-[10px] tracking-[0.22em] text-foreground/65 uppercase">
                    <Radio className="size-3" aria-hidden="true" />
                    {team.name}
                </span>
            </div>

            <div className="grid items-end gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-10">
                <div>
                    <p className="font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                        {t('stream.index.eyebrow')}
                    </p>
                    <h1
                        className={cn(
                            'font-display mt-2 text-4xl leading-[1.04] font-semibold tracking-tight text-balance text-foreground',
                            'sm:text-5xl lg:text-6xl',
                        )}
                    >
                        {t('stream.index.masthead_title')}
                        <span className="text-[var(--accent-ink)]">.</span>
                        <br />
                        <span className="text-foreground/65 italic">
                            {t('stream.index.masthead_subtitle')}
                        </span>
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                        {t('stream.index.description')}
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
                    {t('stream.index.count_stamp_label')}
                </span>
                <span className="font-display mt-1 text-5xl leading-none font-semibold text-[color:var(--stamp-ink)] tabular-nums">
                    {count.toString().padStart(2, '0')}
                </span>
                <span className="mt-1 font-mono text-[9px] tracking-[0.22em] text-[color:var(--stamp-ink)]/70 uppercase">
                    {count === 1
                        ? t('stream.index.count_stamp_session_singular')
                        : t('stream.index.count_stamp_session_plural')}
                </span>
            </div>
        </div>
    );
}

function EmptyState() {
    const { t } = useTranslate();

    return (
        <section className="relative mt-2 overflow-hidden rounded-3xl border border-dashed border-border/80 bg-card/40 px-6 py-14 text-center">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_1px_1px,_var(--border)_1px,_transparent_0)] [background-size:20px_20px] opacity-50"
            />
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--accent-ink)]/10 text-[var(--accent-ink)]">
                <Radio className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                {t('stream.index.sessions_empty_eyebrow')}
            </p>
            <h2 className="font-display mx-auto mt-3 max-w-md text-2xl leading-snug text-balance text-foreground sm:text-3xl">
                {t('stream.index.sessions_empty_title')}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                {t('stream.index.sessions_empty_description')}
            </p>
        </section>
    );
}

function LockedState() {
    const { t } = useTranslate();

    return (
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-border/80 bg-card/40 px-6 py-16 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-foreground/5 text-foreground/60">
                <Lock className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-mono text-[10px] tracking-[0.32em] text-foreground/60 uppercase">
                {t('stream.locked.eyebrow')}
            </p>
            <h2 className="font-display mx-auto mt-3 max-w-md text-2xl leading-snug text-foreground sm:text-3xl">
                {t('stream.locked.title')}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                {t('stream.locked.description')}
            </p>
        </div>
    );
}
