import { Head, Link, setLayoutProps, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    CheckCircle2,
    Copy,
    Hourglass,
    Inbox,
    LayoutGrid,
    ListTodo,
    Settings2,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PlatformIcon, platformLabel } from '@/components/faq/platform-icon';
import type { FaqPlatform } from '@/components/faq/platform-icon';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit as customizeEdit } from '@/routes/customize';
import {
    board as questionsBoard,
    inbox as questionsInbox,
} from '@/routes/questions';

type RecentQuestion = {
    id: number;
    body: string;
    authorName: string | null;
    status: 'pending' | 'approved' | 'answered' | 'rejected';
    answerSource: {
        url: string;
        label: string | null;
        platform: FaqPlatform | null;
    } | null;
    list: { id: number; name: string; color: string | null } | null;
    position: number;
    answeredAt: string | null;
    createdAt: string;
};

type DashboardProps = {
    team: { id: number; name: string; slug: string };
    publicUrl: string;
    counts: {
        pending: number;
        approved: number;
        answered: number;
        lists: number;
    };
    recent: RecentQuestion[];
    permissions: {
        canManageQuestions: boolean;
        canModerate: boolean;
        canCustomize: boolean;
    };
};

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
    { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: 'day', ms: 1000 * 60 * 60 * 24 },
    { unit: 'hour', ms: 1000 * 60 * 60 },
    { unit: 'minute', ms: 1000 * 60 },
];

function formatRelative(iso: string, locale: string, justNow: string): string {
    const formatter = new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
    });
    const diffMs = new Date(iso).getTime() - Date.now();
    const absMs = Math.abs(diffMs);

    if (absMs < 60_000) {
        return justNow;
    }

    for (const { unit, ms } of RELATIVE_UNITS) {
        if (absMs >= ms) {
            return formatter.format(Math.round(diffMs / ms), unit);
        }
    }

    return formatter.format(Math.round(diffMs / 60_000), 'minute');
}

export default function Dashboard({
    team,
    publicUrl,
    counts,
    recent,
    permissions,
}: DashboardProps) {
    const { t, locale } = useTranslate();
    const currentTeam = usePage().props.currentTeam;

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('app.nav.dashboard'),
                href: currentTeam ? dashboard(currentTeam.slug) : '/',
            },
        ],
    });

    const totalQuestions = counts.pending + counts.approved + counts.answered;
    const isEmpty = totalQuestions === 0 && counts.lists === 0;
    const issueNumber = ((team.id % 99) + 1).toString().padStart(2, '0');
    const today = new Date();
    const dateString = today.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <>
            <Head title={t('dashboard.title')} />

            <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-10 pb-24 sm:px-7 sm:pt-14 lg:px-9">
                <Masthead
                    teamName={team.name}
                    issueNumber={issueNumber}
                    dateString={dateString}
                />

                <div
                    aria-hidden="true"
                    className="editorial-rule mt-10 h-px w-full"
                />

                <StatStrip counts={counts} />

                <div
                    aria-hidden="true"
                    className="editorial-rule mt-10 h-px w-full"
                />

                <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-10">
                    <section className="lg:col-span-7">
                        <RecentDispatches
                            recent={recent}
                            team={team}
                            isEmpty={isEmpty}
                            publicUrl={publicUrl}
                        />
                    </section>
                    <aside className="lg:col-span-5">
                        <PublicPageReceipt
                            publicUrl={publicUrl}
                            teamName={team.name}
                        />
                    </aside>
                </div>

                <QuickActions
                    teamSlug={team.slug}
                    canManageQuestions={permissions.canManageQuestions}
                    canCustomize={permissions.canCustomize}
                />
            </div>
        </>
    );
}

function Masthead({
    teamName,
    issueNumber,
    dateString,
}: {
    teamName: string;
    issueNumber: string;
    dateString: string;
}) {
    const { t } = useTranslate();

    return (
        <header className="flex flex-col gap-7">
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.32em] text-foreground/60 uppercase">
                <span
                    aria-hidden="true"
                    className="inline-block size-1.5 rounded-full bg-[var(--accent-ink)]"
                />
                {t('dashboard.masthead.issue', { issue: issueNumber })}
                <span aria-hidden="true" className="text-border">
                    &middot;
                </span>
                <span className="text-foreground/55">{dateString}</span>
                <span aria-hidden="true" className="text-border">
                    &middot;
                </span>
                <span className="text-foreground/55">
                    {t('dashboard.masthead.morning_brief')}
                </span>
            </div>

            <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
                <div>
                    <p className="font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                        {t('dashboard.masthead.eyebrow')}
                    </p>
                    <h1
                        className={cn(
                            'font-display mt-2 text-4xl leading-[1.04] font-semibold tracking-tight text-balance text-foreground',
                            'sm:text-5xl lg:text-[3.75rem]',
                        )}
                    >
                        {teamName}
                        <span className="text-[var(--accent-ink)]">.</span>
                        <span className="hidden text-foreground/65 italic sm:inline">
                            {' '}
                            {t('dashboard.masthead.today_suffix')}
                        </span>
                    </h1>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                        {t('dashboard.masthead.description')}
                    </p>
                </div>

                <div className="hidden lg:block">
                    <BriefStamp issueNumber={issueNumber} />
                </div>
            </div>
        </header>
    );
}

function BriefStamp({ issueNumber }: { issueNumber: string }) {
    const { t } = useTranslate();

    return (
        <div className="relative shrink-0">
            <div
                aria-hidden="true"
                className="absolute -inset-2 -rotate-2 rounded-2xl border border-dashed border-[color:var(--stamp-ink)]/30"
            />
            <div className="relative flex flex-col items-center rounded-xl border border-[color:var(--stamp-ink)]/40 bg-[var(--stamp-ink)]/[0.06] px-6 py-4 text-center">
                <span className="font-mono text-[9px] tracking-[0.32em] text-[var(--stamp-ink)] uppercase">
                    {t('dashboard.stamp.volume', { issue: issueNumber })}
                </span>
                <span className="font-display mt-1 text-4xl leading-none font-semibold text-[var(--stamp-ink)] tabular-nums">
                    {issueNumber}
                </span>
                <span className="mt-1 font-mono text-[9px] tracking-[0.22em] text-[var(--stamp-ink)]/70 uppercase">
                    {t('dashboard.stamp.of_the_press')}
                </span>
            </div>
        </div>
    );
}

function StatStrip({ counts }: { counts: DashboardProps['counts'] }) {
    const { t } = useTranslate();

    const stats: Array<{ label: string; value: number; accent?: boolean }> = [
        {
            label: t('dashboard.stat_strip.pending'),
            value: counts.pending,
            accent: counts.pending > 0,
        },
        { label: t('dashboard.stat_strip.approved'), value: counts.approved },
        { label: t('dashboard.stat_strip.answered'), value: counts.answered },
        { label: t('dashboard.stat_strip.lists'), value: counts.lists },
    ];

    return (
        <section
            aria-label={t('dashboard.stat_strip.aria_label')}
            className={cn(
                'mt-10 grid grid-cols-2 gap-y-7 sm:grid-cols-4 sm:gap-y-0',
            )}
        >
            {stats.map((stat, idx) => (
                <div
                    key={stat.label}
                    className={cn(
                        'relative flex flex-col gap-1 px-4 first:pl-0 sm:px-6',
                        idx > 0 && idx !== 2
                            ? 'before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-foreground/12'
                            : '',
                        idx === 2
                            ? 'sm:before:absolute sm:before:inset-y-2 sm:before:left-0 sm:before:w-px sm:before:bg-foreground/12'
                            : '',
                    )}
                >
                    <span className="font-mono text-[9px] tracking-[0.32em] text-foreground/55 uppercase">
                        {stat.label}
                    </span>
                    <span
                        className={cn(
                            'font-display text-5xl leading-none font-semibold tabular-nums sm:text-6xl',
                            stat.accent
                                ? 'text-[var(--accent-ink)]'
                                : 'text-foreground',
                        )}
                    >
                        {stat.value.toString().padStart(2, '0')}
                    </span>
                </div>
            ))}
        </section>
    );
}

function PublicPageReceipt({
    publicUrl,
    teamName,
}: {
    publicUrl: string;
    teamName: string;
}) {
    const { t } = useTranslate();
    const [copied, setCopied] = useState(false);

    const onCopy = async () => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            toast.error(t('dashboard.public_page.toast_no_clipboard'));

            return;
        }

        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            toast.success(t('dashboard.public_page.toast_copied'));
            setTimeout(() => setCopied(false), 1800);
        } catch {
            toast.error(t('dashboard.public_page.toast_failed'));
        }
    };

    const displayUrl = publicUrl.replace(/^https?:\/\//, '');

    return (
        <article
            className={cn(
                'relative overflow-hidden rounded-xl border border-foreground/15 bg-[var(--accent-ink)]/[0.04]',
                'p-5 sm:p-6',
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,_var(--rule-strong)_1px,_transparent_0)] [background-size:18px_18px] opacity-40"
            />

            <div className="relative">
                <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                    <Sparkles className="size-3" aria-hidden="true" />
                    {t('dashboard.public_page.eyebrow')}
                </div>
                <h2 className="font-display mt-2 text-2xl leading-tight font-semibold text-balance text-foreground sm:text-3xl">
                    {t('dashboard.public_page.title')}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {t('dashboard.public_page.description', { team: teamName })}
                </p>

                <div
                    className={cn(
                        'mt-5 flex items-center gap-2 rounded-md border border-foreground/15 bg-background/60',
                        'px-3 py-2.5 font-mono text-xs tracking-tight text-foreground',
                    )}
                >
                    <span
                        aria-hidden="true"
                        className="text-foreground/45 select-none"
                    >
                        {t('dashboard.public_page.url_prefix')}
                    </span>
                    <span aria-hidden="true" className="text-border">
                        /
                    </span>
                    <span className="truncate">{displayUrl}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={onCopy}
                        className={cn(
                            'group inline-flex min-h-[36px] items-center gap-1.5 rounded-full',
                            'bg-foreground px-4 py-1.5 font-mono text-[10px] tracking-[0.22em] text-background uppercase',
                            'transition-transform hover:-translate-y-0.5',
                        )}
                    >
                        {copied ? (
                            <CheckCircle2
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        ) : (
                            <Copy className="size-3.5" aria-hidden="true" />
                        )}
                        {copied
                            ? t('common.actions.copied')
                            : t('dashboard.public_page.copy_url')}
                    </button>
                    <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'group inline-flex min-h-[36px] items-center gap-1.5 rounded-full',
                            'border border-foreground/20 px-4 py-1.5 font-mono text-[10px] tracking-[0.22em] text-foreground/80 uppercase',
                            'transition-[border-color,color] hover:border-foreground/45 hover:text-foreground',
                        )}
                    >
                        {t('dashboard.public_page.open')}
                        <ArrowUpRight
                            className="size-3 transition-transform group-hover:translate-x-px group-hover:-translate-y-px"
                            aria-hidden="true"
                        />
                    </a>
                </div>
            </div>
        </article>
    );
}

function RecentDispatches({
    recent,
    team,
    isEmpty,
    publicUrl,
}: {
    recent: RecentQuestion[];
    team: { slug: string; name: string };
    isEmpty: boolean;
    publicUrl: string;
}) {
    const { t } = useTranslate();

    if (isEmpty || recent.length === 0) {
        return (
            <EmptyState
                isCompletelyEmpty={isEmpty}
                publicUrl={publicUrl}
                teamName={team.name}
            />
        );
    }

    return (
        <section>
            <header className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div>
                    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.28em] text-foreground/55 uppercase">
                        <span
                            aria-hidden="true"
                            className="inline-block size-1.5 rounded-full bg-foreground/30"
                        />
                        {t('dashboard.recent.eyebrow')}
                        <span aria-hidden="true" className="text-border">
                            &middot;
                        </span>
                        <span className="tabular-nums">
                            {recent.length.toString().padStart(2, '0')}
                        </span>
                    </div>
                    <h2 className="font-display mt-2 text-2xl leading-tight font-semibold text-foreground sm:text-3xl">
                        {t('dashboard.recent.title')}
                    </h2>
                </div>
                <p className="max-w-xs text-sm text-muted-foreground">
                    {t('dashboard.recent.description')}
                </p>
            </header>

            <ol className="flex flex-col">
                {recent.map((question, index) => (
                    <RecentRow
                        key={question.id}
                        question={question}
                        index={index + 1}
                        teamSlug={team.slug}
                    />
                ))}
            </ol>
        </section>
    );
}

function RecentRow({
    question,
    index,
    teamSlug,
}: {
    question: RecentQuestion;
    index: number;
    teamSlug: string;
}) {
    const { t, locale } = useTranslate();
    const author =
        question.authorName?.trim() || t('dashboard.author.anonymous');
    const isAnswered = question.status === 'answered';
    const isPending = question.status === 'pending';
    const time =
        isAnswered && question.answeredAt
            ? question.answeredAt
            : question.createdAt;

    const target = isPending
        ? questionsInbox(teamSlug).url
        : questionsBoard(teamSlug).url;

    return (
        <li className="border-b border-dashed border-foreground/12 first:border-t">
            <Link
                href={target}
                className={cn(
                    'group/row grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 py-5',
                    'transition-colors hover:bg-foreground/[0.02]',
                )}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        'mt-1 font-mono text-[11px] tracking-[0.22em] tabular-nums',
                        isAnswered
                            ? 'text-[var(--accent-ink)]'
                            : 'text-foreground/40',
                    )}
                >
                    {index.toString().padStart(2, '0')}
                </span>

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] tracking-[0.22em] text-foreground/55 uppercase">
                        <StatusChip status={question.status} />
                        {question.list ? (
                            <>
                                <span
                                    aria-hidden="true"
                                    className="text-border"
                                >
                                    /
                                </span>
                                <span>{question.list.name}</span>
                            </>
                        ) : null}
                        <span aria-hidden="true" className="text-border">
                            &middot;
                        </span>
                        <time dateTime={time} className="normal-case">
                            {formatRelative(
                                time,
                                locale,
                                t('dashboard.time.just_now'),
                            )}
                        </time>
                    </div>
                    <p className="font-display mt-2 text-[17px] leading-snug text-balance text-foreground transition-colors group-hover/row:text-foreground sm:text-lg">
                        {question.body}
                    </p>
                    <p className="mt-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                        <span className="text-foreground/65">— {author}</span>
                        {isAnswered &&
                        question.answerSource &&
                        question.answerSource.platform ? (
                            <span className="inline-flex items-center gap-1">
                                <span
                                    aria-hidden="true"
                                    className="mx-2 text-border"
                                >
                                    &middot;
                                </span>
                                <PlatformIcon
                                    platform={question.answerSource.platform}
                                    className="size-3"
                                />
                                <span>
                                    {question.answerSource.label ??
                                        platformLabel(
                                            question.answerSource.platform,
                                        )}
                                </span>
                            </span>
                        ) : null}
                    </p>
                </div>

                <ArrowUpRight
                    className="mt-1 size-4 text-foreground/30 transition-[color,transform] group-hover/row:translate-x-px group-hover/row:-translate-y-px group-hover/row:text-foreground/80"
                    aria-hidden="true"
                />
            </Link>
        </li>
    );
}

function StatusChip({ status }: { status: RecentQuestion['status'] }) {
    const { t } = useTranslate();

    if (status === 'answered') {
        return (
            <span className="inline-flex items-center gap-1 text-[var(--accent-ink)]">
                <CheckCircle2 className="size-2.5" aria-hidden="true" />
                {t('dashboard.status_chip.answered')}
            </span>
        );
    }

    if (status === 'pending') {
        return (
            <span className="inline-flex items-center gap-1 text-foreground/65">
                <Hourglass className="size-2.5" aria-hidden="true" />
                {t('dashboard.status_chip.pending')}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 text-foreground/65">
            <Inbox className="size-2.5" aria-hidden="true" />
            {t('dashboard.status_chip.on_the_desk')}
        </span>
    );
}

function EmptyState({
    isCompletelyEmpty,
    publicUrl,
    teamName,
}: {
    isCompletelyEmpty: boolean;
    publicUrl: string;
    teamName: string;
}) {
    const { t } = useTranslate();

    return (
        <section className="relative px-2 py-10 text-center sm:py-14">
            <div
                aria-hidden="true"
                className="editorial-rule mx-auto h-px w-20"
            />
            <span className="mt-7 inline-flex size-12 items-center justify-center rounded-full bg-[var(--accent-ink)]/10 text-[var(--accent-ink)]">
                <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                {t('dashboard.empty.eyebrow')}
            </p>
            <h2 className="font-display mx-auto mt-3 max-w-md text-2xl leading-snug text-balance text-foreground sm:text-3xl">
                {isCompletelyEmpty
                    ? t('dashboard.empty.title_no_questions', {
                          team: teamName,
                      })
                    : t('dashboard.empty.title_no_filings')}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                {t('dashboard.empty.description')}
            </p>

            <div className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-foreground">
                <span aria-hidden="true" className="text-foreground/45">
                    {t('dashboard.public_page.url_prefix')}
                </span>
                <span aria-hidden="true" className="text-border">
                    /
                </span>
                <span className="truncate">
                    {publicUrl.replace(/^https?:\/\//, '')}
                </span>
            </div>

            <div
                aria-hidden="true"
                className="editorial-rule mx-auto mt-8 h-px w-20"
            />
        </section>
    );
}

function QuickActions({
    teamSlug,
    canManageQuestions,
    canCustomize,
}: {
    teamSlug: string;
    canManageQuestions: boolean;
    canCustomize: boolean;
}) {
    const { t } = useTranslate();

    const actions = [
        {
            label: t('dashboard.quick_actions.inbox_label'),
            description: t('dashboard.quick_actions.inbox_description'),
            href: questionsInbox(teamSlug).url,
            icon: Inbox,
        },
        {
            label: t('dashboard.quick_actions.desk_label'),
            description: t('dashboard.quick_actions.desk_description'),
            href: questionsBoard(teamSlug).url,
            icon: ListTodo,
            disabled: !canManageQuestions,
        },
        {
            label: t('dashboard.quick_actions.customize_label'),
            description: t('dashboard.quick_actions.customize_description'),
            href: customizeEdit(teamSlug).url,
            icon: Settings2,
            disabled: !canCustomize,
        },
    ];

    return (
        <section className="mt-14">
            <div
                aria-hidden="true"
                className="editorial-rule mb-6 h-px w-full"
            />
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                <LayoutGrid className="size-3" aria-hidden="true" />
                {t('dashboard.quick_actions.eyebrow')}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
                {actions.map((action) => (
                    <QuickAction key={action.label} {...action} />
                ))}
            </div>
        </section>
    );
}

function QuickAction({
    label,
    description,
    href,
    icon: Icon,
    disabled = false,
}: {
    label: string;
    description: string;
    href: string;
    icon: typeof Inbox;
    disabled?: boolean;
}) {
    const className = cn(
        'group/action flex items-center justify-between gap-4 border border-foreground/12 px-4 py-4',
        'transition-[border-color,background-color]',
        disabled
            ? 'opacity-50'
            : 'hover:border-foreground/30 hover:bg-foreground/[0.02]',
    );

    const inner = (
        <>
            <div className="flex items-center gap-3">
                <Icon
                    className="size-4 text-foreground/45"
                    aria-hidden="true"
                />
                <div>
                    <span className="font-mono text-[9px] tracking-[0.32em] text-foreground/50 uppercase">
                        {description}
                    </span>
                    <span className="font-display mt-0.5 block text-base font-medium text-foreground">
                        {label}
                    </span>
                </div>
            </div>
            {!disabled ? (
                <ArrowUpRight
                    className="size-4 text-foreground/30 transition-[color,transform] group-hover/action:translate-x-px group-hover/action:-translate-y-px group-hover/action:text-foreground/70"
                    aria-hidden="true"
                />
            ) : null}
        </>
    );

    if (disabled) {
        return (
            <div className={className} aria-disabled="true">
                {inner}
            </div>
        );
    }

    return (
        <Link href={href} className={className}>
            {inner}
        </Link>
    );
}
