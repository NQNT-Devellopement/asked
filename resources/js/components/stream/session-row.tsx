import { Link, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    CheckCircle2,
    Copy,
    RefreshCcw,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
    destroy as destroySession,
    regenerateToken as regenerateSessionToken,
    show as showSession,
} from '@/routes/stream';
import type { StreamSession } from '@/types/stream';

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
    { unit: 'year', ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: 'month', ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: 'day', ms: 1000 * 60 * 60 * 24 },
    { unit: 'hour', ms: 1000 * 60 * 60 },
    { unit: 'minute', ms: 1000 * 60 },
];

function formatRelative(iso: string, locale: string, justNow: string): string {
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
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

type Props = {
    session: StreamSession;
    teamSlug: string;
    canManage: boolean;
};

/**
 * One row per session on the index. Editorial typeset row — stripe of
 * status info on the left, name + meta as the headline, action chips on
 * the right. The "Open control panel" anchor is the row's primary target.
 */
export function SessionRow({ session, teamSlug, canManage }: Props) {
    const { t, locale } = useTranslate();
    const [copied, setCopied] = useState(false);

    const isLive = session.is_active && session.current_question_id !== null;
    const presetLabel = t(`stream.presets.${session.overlay_preset}.label`);
    const listName = session.list?.name ?? t('stream.fields.list_all_approved');
    const justNow = t('stream.time.just_now');
    const polledRel = session.last_polled_at
        ? formatRelative(session.last_polled_at, locale, justNow)
        : null;
    const createdRel = formatRelative(session.created_at, locale, justNow);

    const copyUrl = async () => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            toast.error(t('stream.toast.no_clipboard'));

            return;
        }

        try {
            await navigator.clipboard.writeText(session.overlay_url);
            setCopied(true);
            toast.success(t('stream.toast.url_copied'));
            setTimeout(() => setCopied(false), 1600);
        } catch {
            toast.error(t('stream.toast.failed'));
        }
    };

    const regenerate = () => {
        if (!canManage) {
            return;
        }

        if (!window.confirm(t('stream.actions.regenerate_confirm'))) {
            return;
        }

        router.post(
            regenerateSessionToken([teamSlug, session.id]).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(t('stream.toast.token_regenerated')),
                onError: () => toast.error(t('stream.toast.failed')),
            },
        );
    };

    const end = () => {
        if (!canManage) {
            return;
        }

        if (!window.confirm(t('stream.actions.end_session_confirm'))) {
            return;
        }

        router.delete(destroySession([teamSlug, session.id]).url, {
            preserveScroll: true,
            onSuccess: () => toast.success(t('stream.toast.destroyed')),
            onError: () => toast.error(t('stream.toast.failed')),
        });
    };

    return (
        <article
            className={cn(
                'group/row relative grid gap-4 border-b border-dashed border-foreground/12 py-5 first:border-t',
                'sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6',
            )}
        >
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-[9px] tracking-[0.22em] uppercase">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1.5',
                            isLive
                                ? 'text-[var(--accent-ink)]'
                                : 'text-foreground/55',
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                'inline-block size-1.5 rounded-full',
                                isLive
                                    ? 'animate-pulse bg-[var(--accent-ink)]'
                                    : 'bg-foreground/30',
                            )}
                        />
                        {isLive
                            ? t('stream.badges.live_now')
                            : t('stream.badges.standby')}
                    </span>
                    <span aria-hidden="true" className="text-border">
                        /
                    </span>
                    <span className="text-foreground/55">
                        {t('stream.badges.preset_chip')}
                        <span className="ml-1 text-foreground/85 normal-case">
                            {presetLabel}
                        </span>
                    </span>
                    <span aria-hidden="true" className="text-border">
                        /
                    </span>
                    <span className="text-foreground/55">
                        {t('stream.badges.list_chip')}
                        <span className="ml-1 text-foreground/85 normal-case">
                            {listName}
                        </span>
                    </span>
                </div>

                <h3 className="font-display mt-2 text-xl leading-tight text-balance text-foreground sm:text-2xl">
                    <Link
                        href={showSession([teamSlug, session.id]).url}
                        className="transition-colors group-hover/row:text-[var(--accent-ink)]"
                    >
                        {session.name}
                    </Link>
                </h3>

                <p className="mt-1.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                    <span>
                        {t('stream.time.created_ago', { time: createdRel })}
                    </span>
                    <span aria-hidden="true" className="mx-2 text-border">
                        &middot;
                    </span>
                    <span>
                        {polledRel
                            ? t('stream.time.polled_ago', { time: polledRel })
                            : t('stream.time.never_polled')}
                    </span>
                    {session.candidates_remaining > 0 ? (
                        <>
                            <span
                                aria-hidden="true"
                                className="mx-2 text-border"
                            >
                                &middot;
                            </span>
                            <span>
                                {t('stream.show.queue_remaining', {
                                    count: session.candidates_remaining,
                                })}
                            </span>
                        </>
                    ) : null}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:flex-nowrap sm:justify-end">
                <button
                    type="button"
                    onClick={copyUrl}
                    className={cn(
                        'inline-flex min-h-[40px] items-center gap-1.5 rounded-full',
                        'border border-foreground/15 bg-background/70 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-foreground/80 uppercase',
                        'transition-[border-color,background-color] hover:border-foreground/40 hover:bg-card',
                    )}
                >
                    {copied ? (
                        <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    ) : (
                        <Copy className="size-3.5" aria-hidden="true" />
                    )}
                    {copied
                        ? t('common.actions.copied')
                        : t('stream.actions.copy_overlay_url')}
                </button>

                <button
                    type="button"
                    onClick={regenerate}
                    disabled={!canManage}
                    aria-label={t('stream.actions.regenerate_token')}
                    title={t('stream.actions.regenerate_token')}
                    className={cn(
                        'inline-flex size-10 items-center justify-center rounded-full',
                        'border border-foreground/15 bg-background/70 text-foreground/65',
                        'transition-[border-color,color] hover:border-foreground/40 hover:text-foreground',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                >
                    <RefreshCcw className="size-3.5" aria-hidden="true" />
                </button>

                <button
                    type="button"
                    onClick={end}
                    disabled={!canManage}
                    aria-label={t('stream.actions.end_session')}
                    title={t('stream.actions.end_session')}
                    className={cn(
                        'inline-flex size-10 items-center justify-center rounded-full',
                        'border border-foreground/15 bg-background/70 text-foreground/65',
                        'transition-[border-color,color] hover:border-destructive/60 hover:text-destructive',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                </button>

                <Link
                    href={showSession([teamSlug, session.id]).url}
                    className={cn(
                        'group/cta inline-flex min-h-[40px] items-center gap-1.5 rounded-full',
                        'bg-foreground px-4 py-1.5 font-mono text-[10px] tracking-[0.22em] text-background uppercase',
                        'transition-transform hover:-translate-y-0.5',
                    )}
                >
                    {t('stream.actions.open_panel')}
                    <ArrowUpRight
                        className="size-3 transition-transform group-hover/cta:translate-x-px group-hover/cta:-translate-y-px"
                        aria-hidden="true"
                    />
                </Link>
            </div>
        </article>
    );
}
