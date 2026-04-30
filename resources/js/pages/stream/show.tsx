import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import type { Check } from 'lucide-react';
import {
    ArrowLeft,
    EyeOff,
    Link2,
    Lock,
    PowerOff,
    Radio,
    SkipForward,
    SquareDashed,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    DeskGrain,
    DeskSlug,
    DeskStyleVariables,
} from '@/components/questions/desk-chrome';
import { AddressedPanel } from '@/components/stream/addressed-panel';
import { AnswerCurrentComposer } from '@/components/stream/answer-current-composer';
import { EndSessionModal } from '@/components/stream/end-session-modal';
import { OverlayUrlField } from '@/components/stream/overlay-url-field';
import { QueueCard } from '@/components/stream/queue-card';
import { SessionSettingsPanel } from '@/components/stream/session-settings-panel';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
    address as addressSession,
    hide as hideOverlay,
    index as streamIndex,
    next as advanceSession,
    show as showSession,
    skip as skipSession,
} from '@/routes/stream';
import type {
    StreamPermissions,
    StreamQuestion,
    StreamSession,
    StreamSourceList,
} from '@/types/stream';

type ShowProps = {
    team: { name: string; slug: string };
    session: StreamSession;
    lists: StreamSourceList[];
    queue: StreamQuestion[];
    addressed: StreamQuestion[];
    history: StreamQuestion[];
    permissions: StreamPermissions;
};

export default function StreamShow({
    team,
    session,
    lists,
    queue,
    addressed,
    permissions,
}: ShowProps) {
    const { t } = useTranslate();
    const currentTeam = usePage().props.currentTeam;

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('stream.index.breadcrumb'),
                href: currentTeam ? streamIndex(currentTeam.slug).url : '#',
            },
            {
                title: session.name,
                href: currentTeam
                    ? showSession([currentTeam.slug, session.id]).url
                    : '#',
            },
        ],
    });

    const [answering, setAnswering] = useState(false);
    const [endModalOpen, setEndModalOpen] = useState(false);

    const isLive = session.is_active && session.current_question_id !== null;
    const sessionEnded = !session.is_active;
    const pendingCount = addressed.filter(
        (q) => q.answerSource === null,
    ).length;

    const address = () => {
        if (
            !permissions.canManage ||
            sessionEnded ||
            session.current_question === null
        ) {
            return;
        }

        router.post(
            addressSession([team.slug, session.id]).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success(t('stream.toast.addressed')),
                onError: () => toast.error(t('stream.toast.failed')),
            },
        );
    };

    const advance = () => {
        if (!permissions.canManage || sessionEnded) {
            return;
        }

        router.post(
            advanceSession([team.slug, session.id]).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success(t('stream.toast.advanced')),
                onError: () => toast.error(t('stream.toast.failed')),
            },
        );
    };

    const skip = () => {
        if (
            !permissions.canManage ||
            sessionEnded ||
            session.current_question === null
        ) {
            return;
        }

        router.post(
            skipSession([team.slug, session.id]).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success(t('stream.toast.skipped')),
                onError: () => toast.error(t('stream.toast.failed')),
            },
        );
    };

    const hide = () => {
        if (
            !permissions.canManage ||
            sessionEnded ||
            session.current_question === null
        ) {
            return;
        }

        router.post(
            hideOverlay([team.slug, session.id]).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success(t('stream.toast.hidden')),
                onError: () => toast.error(t('stream.toast.failed')),
            },
        );
    };

    const startAnswer = () => {
        if (
            !permissions.canManage ||
            sessionEnded ||
            session.current_question === null
        ) {
            return;
        }

        setAnswering(true);
    };

    const openEndModal = () => {
        if (!permissions.canManage || sessionEnded) {
            return;
        }

        setEndModalOpen(true);
    };

    // Hotkeys: A / N / S / H / E. Skip while typing in inputs/textareas/contenteditable
    // so keystrokes inside any open composer don't trigger overlay actions. Disabled
    // entirely once the session has ended — at that point only the Addressed panel
    // is interactive.
    useEffect(() => {
        if (!permissions.canManage || sessionEnded) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }

            const target = event.target as HTMLElement | null;

            if (target) {
                const tag = target.tagName;

                if (
                    tag === 'INPUT' ||
                    tag === 'TEXTAREA' ||
                    tag === 'SELECT' ||
                    target.isContentEditable
                ) {
                    return;
                }
            }

            switch (event.key.toLowerCase()) {
                case 'a':
                    event.preventDefault();
                    address();
                    break;
                case 'n':
                    event.preventDefault();
                    advance();
                    break;
                case 's':
                    event.preventDefault();
                    skip();
                    break;
                case 'h':
                    event.preventDefault();
                    hide();
                    break;
                case 'e':
                    event.preventDefault();
                    openEndModal();
                    break;
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        permissions.canManage,
        sessionEnded,
        session.id,
        session.current_question_id,
        team.slug,
    ]);

    return (
        <>
            <Head title={`${session.name} — ${t('stream.show.title')}`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="desk-root relative isolate min-h-[calc(100vh-4rem)] bg-[var(--page-bg)] text-foreground antialiased">
                <DeskStyleVariables />
                <DeskGrain />

                <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 pt-6 pb-24 sm:px-7 sm:pt-10 lg:px-9">
                    <Topbar
                        team={team}
                        session={session}
                        isLive={isLive}
                        canManage={permissions.canManage}
                        onEnd={openEndModal}
                    />

                    <div
                        aria-hidden="true"
                        className="desk-rule mt-6 h-px w-full"
                    />

                    {!permissions.canManage ? (
                        <LockedState />
                    ) : (
                        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-8">
                            {/* Stage column */}
                            <section className="flex flex-col gap-5 lg:col-span-7">
                                {sessionEnded ? (
                                    <EndedStage session={session} />
                                ) : (
                                    <Stage
                                        session={session}
                                        answering={answering}
                                        onCancelAnswer={() =>
                                            setAnswering(false)
                                        }
                                        onSavedAnswer={() =>
                                            setAnswering(false)
                                        }
                                        teamSlug={team.slug}
                                    />
                                )}
                                {!sessionEnded ? (
                                    <>
                                        <PrimaryAddressBar
                                            isLive={isLive}
                                            answering={answering}
                                            onAddress={address}
                                            onAnswerWithUrl={startAnswer}
                                            canManage={permissions.canManage}
                                        />
                                        <ActionRow
                                            isLive={isLive}
                                            onNext={advance}
                                            onSkip={skip}
                                            onHide={hide}
                                            onEnd={openEndModal}
                                            canManage={permissions.canManage}
                                        />
                                        <Hotkeys />
                                    </>
                                ) : null}

                                <AddressedPanel
                                    questions={addressed}
                                    teamSlug={team.slug}
                                    sessionId={session.id}
                                    canManage={permissions.canManage}
                                />
                            </section>

                            {/* Queue + settings column */}
                            <aside className="flex flex-col gap-5 lg:col-span-5">
                                {!sessionEnded ? (
                                    <Queue
                                        queue={queue}
                                        teamSlug={team.slug}
                                        sessionId={session.id}
                                        candidatesRemaining={
                                            session.candidates_remaining
                                        }
                                        canManage={permissions.canManage}
                                    />
                                ) : null}
                                {!sessionEnded ? <SkippedNote /> : null}
                                <SessionSettingsPanel
                                    session={session}
                                    teamSlug={team.slug}
                                    lists={lists}
                                    canManage={permissions.canManage}
                                />
                            </aside>
                        </div>
                    )}
                </div>

                <EndSessionModal
                    open={endModalOpen}
                    onOpenChange={setEndModalOpen}
                    teamSlug={team.slug}
                    sessionId={session.id}
                    addressedCount={addressed.length}
                    pendingCount={pendingCount}
                />
            </div>
        </>
    );
}

function Topbar({
    team,
    session,
    isLive,
    canManage,
    onEnd,
}: {
    team: { name: string; slug: string };
    session: StreamSession;
    isLive: boolean;
    canManage: boolean;
    onEnd: () => void;
}) {
    const { t } = useTranslate();
    const sessionEnded = !session.is_active;

    return (
        <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    href={streamIndex(team.slug).url}
                    className={cn(
                        'group inline-flex min-h-[36px] items-center gap-1.5 rounded-full',
                        'border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-foreground/75 uppercase',
                        'transition-[border-color,background-color] hover:border-foreground/50 hover:bg-card',
                    )}
                >
                    <ArrowLeft
                        className="size-3 transition-transform group-hover:-translate-x-px"
                        aria-hidden="true"
                    />
                    {t('stream.show.back_to_index')}
                </Link>

                <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.32em] uppercase">
                    {!sessionEnded && canManage ? (
                        <button
                            type="button"
                            onClick={onEnd}
                            className={cn(
                                'inline-flex min-h-[28px] items-center gap-1.5 rounded-full',
                                'border border-foreground/20 bg-background/70 px-3 py-1',
                                'text-foreground/80 transition-[border-color,background-color,color]',
                                'hover:border-[var(--accent-ink)] hover:bg-[var(--accent-ink)]/10 hover:text-foreground',
                            )}
                        >
                            <PowerOff className="size-3" aria-hidden="true" />
                            {t('stream.actions.end_session')}
                            <kbd className="ml-1 inline-flex size-4 items-center justify-center rounded-sm border border-foreground/20 bg-background/60 px-1 font-mono text-[8px] tracking-normal text-foreground/75">
                                E
                            </kbd>
                        </button>
                    ) : null}
                    <span
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1',
                            isLive
                                ? 'bg-[var(--accent-ink)] text-[var(--accent-foreground)]'
                                : 'bg-foreground/10 text-foreground/65',
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                'inline-block size-1.5 rounded-full',
                                isLive
                                    ? 'animate-pulse bg-[var(--accent-foreground)]/95'
                                    : 'bg-foreground/40',
                            )}
                        />
                        {sessionEnded
                            ? t('stream.session_ended.label')
                            : isLive
                              ? t('stream.show.on_air')
                              : t('stream.show.off_air')}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="min-w-0">
                    <DeskSlug label={t('stream.show.eyebrow')} accent />
                    <h1 className="font-display mt-2 text-3xl leading-[1.04] font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
                        {session.name}
                        <span className="text-[var(--accent-ink)]">.</span>
                    </h1>
                    <p className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                        <Radio className="size-3" aria-hidden="true" />
                        {team.name}
                    </p>
                </div>

                {canManage && !sessionEnded ? (
                    <div className="w-full max-w-md sm:w-auto">
                        <OverlayUrlField
                            url={session.overlay_url}
                            density="compact"
                        />
                    </div>
                ) : null}
            </div>
        </header>
    );
}

function Stage({
    session,
    answering,
    onCancelAnswer,
    onSavedAnswer,
    teamSlug,
}: {
    session: StreamSession;
    answering: boolean;
    onCancelAnswer: () => void;
    onSavedAnswer: () => void;
    teamSlug: string;
}) {
    const { t } = useTranslate();
    const current = session.current_question;

    return (
        <article
            className={cn(
                'relative isolate overflow-hidden rounded-3xl border border-foreground/15 bg-card/80',
                'shadow-[0_1px_0_rgba(0,0,0,0.02),0_30px_60px_-50px_rgba(15,12,8,0.55)]',
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,_var(--rule-strong)_1px,_transparent_0)] [background-size:24px_24px] opacity-25"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-[var(--accent-ink)]/[0.10] via-transparent to-transparent"
            />

            <div className="relative px-5 py-6 sm:px-7 sm:py-8">
                <div className="flex items-center justify-between gap-3">
                    <DeskSlug
                        label={t('stream.show.current_eyebrow')}
                        accent={current !== null}
                    />
                    {current?.list ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background/70 px-2.5 py-1 font-mono text-[9px] tracking-[0.22em] text-foreground/70 uppercase">
                            <span
                                aria-hidden="true"
                                className="inline-block size-1.5 rounded-full"
                                style={{
                                    backgroundColor:
                                        current.list.color ??
                                        'var(--foreground)',
                                }}
                            />
                            {current.list.name}
                        </span>
                    ) : null}
                </div>

                {current ? (
                    <>
                        <p
                            className={cn(
                                'font-display mt-5 text-balance text-foreground',
                                'text-3xl leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.75rem]',
                            )}
                        >
                            <span className="text-[var(--accent-ink)] italic">
                                &ldquo;
                            </span>
                            {current.body}
                            <span className="text-[var(--accent-ink)] italic">
                                &rdquo;
                            </span>
                        </p>

                        <p className="mt-4 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
                            {t('stream.show.current_author', {
                                author:
                                    current.authorName?.trim() ||
                                    t('dashboard.author.anonymous'),
                            })}
                        </p>

                        {answering ? (
                            <div className="mt-5 rounded-xl border border-dashed border-foreground/15 bg-background/40 p-4">
                                <AnswerCurrentComposer
                                    teamSlug={teamSlug}
                                    sessionId={session.id}
                                    onCancel={onCancelAnswer}
                                    onSaved={onSavedAnswer}
                                />
                            </div>
                        ) : null}
                    </>
                ) : (
                    <NoCurrentState
                        candidatesRemaining={session.candidates_remaining}
                    />
                )}
            </div>
        </article>
    );
}

function EndedStage({ session }: { session: StreamSession }) {
    const { t } = useTranslate();

    const endedDate = session.last_polled_at
        ? new Date(session.last_polled_at)
        : null;

    return (
        <article
            className={cn(
                'relative isolate overflow-hidden rounded-3xl border border-dashed border-foreground/20 bg-card/55',
                'shadow-[0_1px_0_rgba(0,0,0,0.02)]',
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(135deg,_var(--rule-strong)_0_1px,_transparent_1px_8px)] opacity-15"
            />

            <div className="relative px-5 py-10 text-center sm:px-7 sm:py-14">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-foreground/5 text-foreground/55">
                    <PowerOff className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                    {t('stream.show.session_ended_eyebrow')}
                </p>
                <h2 className="font-display mx-auto mt-2 max-w-md text-3xl leading-tight text-balance text-foreground sm:text-4xl">
                    {t('stream.show.session_ended_title')}
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                    {t('stream.show.session_ended_description')}
                </p>
                {endedDate ? (
                    <p className="mt-4 font-mono text-[10px] tracking-[0.22em] text-foreground/50 uppercase">
                        <time dateTime={session.last_polled_at ?? undefined}>
                            {endedDate.toLocaleString()}
                        </time>
                    </p>
                ) : null}
            </div>
        </article>
    );
}

function NoCurrentState({
    candidatesRemaining,
}: {
    candidatesRemaining: number;
}) {
    const { t } = useTranslate();

    if (candidatesRemaining === 0) {
        return (
            <div className="mt-6 rounded-2xl border border-dashed border-foreground/15 bg-background/40 px-5 py-10 text-center">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-foreground/5 text-foreground/55">
                    <SquareDashed className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                    {t('stream.show.no_more_eyebrow')}
                </p>
                <h3 className="font-display mx-auto mt-2 max-w-md text-2xl leading-snug text-balance text-foreground">
                    {t('stream.show.no_more_title')}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                    {t('stream.show.no_more_description')}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6 rounded-2xl border border-dashed border-foreground/15 bg-background/40 px-5 py-10 text-center">
            <p className="font-display text-2xl leading-snug text-foreground/65 italic sm:text-3xl">
                {t('stream.show.no_question')}
            </p>
            <p className="mt-2 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                {t('stream.show.no_question_hint')}
            </p>
        </div>
    );
}

function PrimaryAddressBar({
    isLive,
    answering,
    onAddress,
    onAnswerWithUrl,
    canManage,
}: {
    isLive: boolean;
    answering: boolean;
    onAddress: () => void;
    onAnswerWithUrl: () => void;
    canManage: boolean;
}) {
    const { t } = useTranslate();

    const disabledOnAir = !canManage || !isLive;

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                onClick={onAddress}
                disabled={disabledOnAir}
                className={cn(
                    'group/address relative isolate flex min-h-[68px] w-full items-center justify-between gap-4 overflow-hidden rounded-2xl px-5 py-4 text-left',
                    'bg-[var(--accent-ink)] text-[var(--accent-foreground)]',
                    'shadow-[0_1px_0_rgba(0,0,0,0.04),0_18px_40px_-22px_rgba(15,12,8,0.55)]',
                    'transition-transform hover:-translate-y-0.5 active:translate-y-0',
                    'focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)] focus-visible:outline-none',
                    'disabled:cursor-not-allowed disabled:opacity-45',
                )}
            >
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(135deg,_var(--accent-foreground)_0_1px,_transparent_1px_14px)] opacity-[0.07]"
                />
                <span className="relative flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] tracking-[0.32em] text-[var(--accent-foreground)]/75 uppercase">
                        [A] {t('stream.actions.address_short')}
                    </span>
                    <span className="font-display text-xl leading-tight font-semibold sm:text-2xl">
                        {t('stream.actions.address')}
                    </span>
                </span>
                <span className="relative inline-flex items-center gap-2">
                    <span className="font-display text-3xl leading-none">
                        →
                    </span>
                </span>
            </button>

            <div className="flex items-center justify-end">
                <button
                    type="button"
                    onClick={onAnswerWithUrl}
                    disabled={disabledOnAir || answering}
                    className={cn(
                        'inline-flex min-h-[32px] items-center gap-1.5 rounded-full',
                        'border border-foreground/15 bg-background/60 px-3 py-1',
                        'font-mono text-[9px] tracking-[0.22em] text-foreground/70 uppercase',
                        'transition-[border-color,background-color,color]',
                        'hover:border-foreground/45 hover:bg-card hover:text-foreground',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                >
                    <Link2 className="size-3" aria-hidden="true" />
                    {t('stream.actions.answer_with_url_now')}
                </button>
            </div>
        </div>
    );
}

function ActionRow({
    isLive,
    onNext,
    onSkip,
    onHide,
    onEnd,
    canManage,
}: {
    isLive: boolean;
    onNext: () => void;
    onSkip: () => void;
    onHide: () => void;
    onEnd: () => void;
    canManage: boolean;
}) {
    const { t } = useTranslate();

    const disabledOnAir = !canManage || !isLive;
    const disabledMgmt = !canManage;

    return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            <SecondaryAction
                label={t('stream.actions.next')}
                hotkey="N"
                onClick={onNext}
                disabled={disabledMgmt}
                tone="primary"
            />
            <SecondaryAction
                label={t('stream.actions.skip')}
                hotkey="S"
                onClick={onSkip}
                disabled={disabledOnAir}
                icon={SkipForward}
            />
            <SecondaryAction
                label={t('stream.actions.hide')}
                hotkey="H"
                onClick={onHide}
                disabled={disabledOnAir}
                icon={EyeOff}
            />
            <SecondaryAction
                label={t('stream.actions.end_session')}
                hotkey="E"
                onClick={onEnd}
                disabled={disabledMgmt}
                icon={PowerOff}
                tone="end"
            />
        </div>
    );
}

function SecondaryAction({
    label,
    hotkey,
    onClick,
    disabled,
    icon: Icon,
    tone = 'neutral',
}: {
    label: string;
    hotkey: string;
    onClick: () => void;
    disabled: boolean;
    icon?: typeof Check;
    tone?: 'primary' | 'neutral' | 'end';
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'group/action relative flex min-h-[60px] items-center justify-between gap-3 overflow-hidden rounded-xl px-3.5 py-2.5 text-left transition-all',
                'focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/40 focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-40',
                tone === 'primary'
                    ? 'bg-foreground text-background hover:-translate-y-0.5'
                    : tone === 'end'
                      ? 'border border-foreground/15 bg-card/60 text-foreground hover:border-[var(--accent-ink)]/55 hover:bg-[var(--accent-ink)]/[0.06]'
                      : 'border border-foreground/15 bg-card/70 text-foreground hover:border-foreground/45 hover:bg-card',
            )}
        >
            <span className="flex flex-col gap-0.5">
                <span
                    className={cn(
                        'font-mono text-[9px] tracking-[0.32em] uppercase',
                        tone === 'primary'
                            ? 'text-background/65'
                            : 'text-foreground/55',
                    )}
                >
                    [{hotkey}]
                </span>
                <span
                    className={cn(
                        'font-display text-sm leading-tight font-semibold sm:text-[15px]',
                    )}
                >
                    {label}
                </span>
            </span>
            {Icon ? (
                <Icon
                    className={cn(
                        'size-4 shrink-0 opacity-70 transition-transform group-hover/action:translate-x-px',
                    )}
                    aria-hidden="true"
                />
            ) : (
                <span
                    aria-hidden="true"
                    className={cn(
                        'font-display text-2xl leading-none',
                        tone === 'primary'
                            ? 'text-background'
                            : 'text-foreground/55',
                    )}
                >
                    →
                </span>
            )}
        </button>
    );
}

function Hotkeys() {
    const { t } = useTranslate();

    const items: Array<{ key: string; label: string }> = [
        { key: 'A', label: t('stream.hotkeys.address') },
        { key: 'N', label: t('stream.hotkeys.next') },
        { key: 'S', label: t('stream.hotkeys.skip') },
        { key: 'H', label: t('stream.hotkeys.hide') },
        { key: 'E', label: t('stream.hotkeys.end') },
    ];

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[9px] tracking-[0.32em] text-muted-foreground uppercase">
            <span>{t('stream.hotkeys.eyebrow')}</span>
            <span aria-hidden="true" className="text-border">
                /
            </span>
            {items.map((item, idx) => (
                <span key={item.key} className="inline-flex items-center gap-1">
                    <kbd className="inline-flex size-5 items-center justify-center rounded border border-foreground/20 bg-background/60 px-1 font-mono text-[9px] tracking-normal text-foreground/85">
                        {item.key}
                    </kbd>
                    <span>{item.label}</span>
                    {idx < items.length - 1 ? (
                        <span aria-hidden="true" className="ml-2 text-border">
                            &middot;
                        </span>
                    ) : null}
                </span>
            ))}
        </div>
    );
}

function Queue({
    queue,
    teamSlug,
    sessionId,
    candidatesRemaining,
    canManage,
}: {
    queue: StreamQuestion[];
    teamSlug: string;
    sessionId: number;
    candidatesRemaining: number;
    canManage: boolean;
}) {
    const { t } = useTranslate();

    return (
        <section
            className={cn(
                'rounded-2xl border border-foreground/15 bg-card/70 px-4 py-4 sm:px-5 sm:py-5',
            )}
        >
            <header className="flex items-end justify-between gap-3">
                <div>
                    <DeskSlug
                        label={t('stream.show.queue_eyebrow')}
                        count={queue.length}
                    />
                    <h2 className="font-display mt-1.5 text-xl font-semibold text-foreground sm:text-2xl">
                        {t('stream.show.queue_title')}
                    </h2>
                </div>
                <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                    {t('stream.show.queue_remaining', {
                        count: candidatesRemaining,
                    })}
                </p>
            </header>

            {queue.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-foreground/15 bg-background/40 px-4 py-8 text-center">
                    <p className="font-display text-base text-foreground/70">
                        {t('stream.show.queue_empty_title')}
                    </p>
                    <p className="mt-1 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                        {t('stream.show.queue_empty_description')}
                    </p>
                </div>
            ) : (
                <ol className="mt-4 flex flex-col gap-2.5">
                    {queue.map((question, idx) => (
                        <li key={question.id}>
                            <QueueCard
                                question={question}
                                index={idx + 1}
                                teamSlug={teamSlug}
                                sessionId={sessionId}
                                canManage={canManage}
                            />
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}

function SkippedNote() {
    const { t } = useTranslate();

    // TODO: backend doesn't expose a "reset skipped" endpoint yet — once it
    // ships, surface a button here that re-includes skipped questions.
    return (
        <div className="rounded-2xl border border-dashed border-foreground/15 bg-card/40 px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] tracking-[0.32em] text-foreground/60 uppercase">
                    {t('stream.show.skipped_label')}
                </span>
            </div>
            <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                {t('stream.show.skipped_help')}
            </p>
        </div>
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
