import { useForm } from '@inertiajs/react';
import { Link2, PowerOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PlatformIcon, platformLabel } from '@/components/faq/platform-icon';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useTranslate } from '@/lib/i18n';
import { detectPlatform, isLikelyUrl } from '@/lib/platform-detect';
import { cn } from '@/lib/utils';
import { end as endSession } from '@/routes/stream';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teamSlug: string;
    sessionId: number;
    /** Number of questions addressed during the session (for the summary line). */
    addressedCount: number;
    /** Number of those still awaiting a source URL. */
    pendingCount: number;
};

type FormShape = {
    source_url: string;
    source_label: string;
};

/**
 * The post-session URL applicator. Streamer pastes ONE URL → it gets
 * applied to every still-pending addressed question in a single bulk
 * update on the backend. Or they end without a URL and reconcile later
 * via the Addressed panel.
 */
export function EndSessionModal({
    open,
    onOpenChange,
    teamSlug,
    sessionId,
    addressedCount,
    pendingCount,
}: Props) {
    const { t } = useTranslate();
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } =
        useForm<FormShape>({
            source_url: '',
            source_label: '',
        });

    // "Adjusting state when a prop changes" — reset form when re-opened.
    const [prevOpen, setPrevOpen] = useState(open);

    if (prevOpen !== open) {
        setPrevOpen(open);

        if (open) {
            reset();
        }
    }

    useEffect(() => {
        if (open) {
            // Microtask: input is mounted in this same paint, focus next tick.
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);

    const platform = detectPlatform(data.source_url);
    const valid = isLikelyUrl(data.source_url);

    const submitWithUrl = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!valid) {
            return;
        }

        post(endSession([teamSlug, sessionId]).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    t('stream.toast.session_ended_with_url', {
                        count: pendingCount,
                    }),
                );
                onOpenChange(false);
                reset();
            },
            onError: () => toast.error(t('stream.toast.failed')),
        });
    };

    const endWithoutUrl = () => {
        // Bypass form validation: send empty body via the same endpoint.
        setData('source_url', '');
        setData('source_label', '');

        post(endSession([teamSlug, sessionId]).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('stream.toast.session_ended'));
                onOpenChange(false);
                reset();
            },
            onError: () => toast.error(t('stream.toast.failed')),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'border-foreground/20 bg-card/95 sm:max-w-xl',
                    'shadow-[0_30px_60px_-30px_rgba(15,12,8,0.45)]',
                )}
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[var(--accent-ink)]/60 to-transparent"
                />

                <DialogHeader className="gap-3">
                    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.32em] text-muted-foreground uppercase">
                        <span
                            aria-hidden="true"
                            className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--accent-ink)]/12 text-[var(--accent-ink)]"
                        >
                            <PowerOff className="size-3" />
                        </span>
                        {t('stream.actions.end_session')}
                    </div>
                    <DialogTitle className="font-display text-2xl leading-tight tracking-tight text-foreground sm:text-3xl">
                        {t('stream.end.title')}
                        <span className="text-[var(--accent-ink)]">.</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                        {t('stream.end.subtitle')}
                    </DialogDescription>
                </DialogHeader>

                <Summary addressed={addressedCount} pending={pendingCount} />

                <form onSubmit={submitWithUrl} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="end-session-url"
                            className="font-mono text-[10px] tracking-[0.28em] text-foreground/65 uppercase"
                        >
                            {t('stream.end.url_label')}
                        </label>
                        <div
                            className={cn(
                                'group relative flex items-center rounded-lg border bg-background/80 transition-colors',
                                'focus-within:border-[var(--accent-ink)] focus-within:ring-2 focus-within:ring-[var(--accent-ink)]/25',
                                errors.source_url
                                    ? 'border-destructive'
                                    : 'border-border/80',
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className="ml-3 inline-flex size-5 items-center justify-center text-foreground/40"
                            >
                                <Link2 className="size-3.5" />
                            </span>
                            <input
                                ref={inputRef}
                                id="end-session-url"
                                type="url"
                                inputMode="url"
                                value={data.source_url}
                                onChange={(event) =>
                                    setData('source_url', event.target.value)
                                }
                                placeholder={t('stream.end.url_placeholder')}
                                aria-invalid={Boolean(errors.source_url)}
                                className={cn(
                                    'min-h-[42px] flex-1 bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/55',
                                )}
                            />
                            <span
                                className={cn(
                                    'mr-3 inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.22em] uppercase',
                                    valid
                                        ? 'text-[var(--accent-ink)]'
                                        : 'text-foreground/40',
                                )}
                            >
                                <PlatformIcon
                                    platform={platform}
                                    className="size-3"
                                />
                                <span>
                                    {valid
                                        ? platformLabel(platform)
                                        : t(
                                              'questions.answer_composer.no_platform',
                                          )}
                                </span>
                            </span>
                        </div>
                        <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
                            {t('stream.end.url_help')}
                        </p>
                        {errors.source_url ? (
                            <p className="text-[11px] text-destructive">
                                {errors.source_url}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="end-session-label"
                            className="font-mono text-[10px] tracking-[0.28em] text-foreground/65 uppercase"
                        >
                            {t('stream.end.label_label')}
                        </label>
                        <input
                            id="end-session-label"
                            type="text"
                            maxLength={120}
                            value={data.source_label}
                            onChange={(event) =>
                                setData('source_label', event.target.value)
                            }
                            placeholder={t('stream.end.label_placeholder')}
                            className={cn(
                                'min-h-[42px] rounded-lg border border-border/80 bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/55',
                                'focus:border-[var(--accent-ink)] focus:ring-2 focus:ring-[var(--accent-ink)]/25 focus:outline-none',
                            )}
                        />
                    </div>

                    <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                            className={cn(
                                'inline-flex min-h-[40px] items-center justify-center rounded-full px-3.5 py-1.5',
                                'font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase',
                                'hover:text-foreground',
                                'disabled:opacity-50',
                            )}
                        >
                            {t('stream.end.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={endWithoutUrl}
                            disabled={processing}
                            className={cn(
                                'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full',
                                'border border-foreground/20 bg-background/70 px-4 py-1.5',
                                'font-mono text-[10px] tracking-[0.22em] text-foreground/85 uppercase',
                                'transition-[border-color,background-color]',
                                'hover:border-foreground/45 hover:bg-card',
                                'disabled:cursor-not-allowed disabled:opacity-50',
                            )}
                        >
                            {processing && !valid ? (
                                <Spinner className="size-3" />
                            ) : null}
                            {t('stream.end.end_without_url')}
                        </button>
                        <button
                            type="submit"
                            disabled={!valid || processing}
                            className={cn(
                                'inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full',
                                'bg-[var(--accent-ink)] px-4 py-1.5 shadow-sm',
                                'font-mono text-[10px] tracking-[0.22em] text-[var(--accent-foreground)] uppercase',
                                'transition-transform hover:-translate-y-0.5',
                                'disabled:pointer-events-none disabled:opacity-45',
                            )}
                        >
                            {processing && valid ? (
                                <Spinner className="size-3" />
                            ) : null}
                            {t('stream.end.apply_and_end')}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Summary({
    addressed,
    pending,
}: {
    addressed: number;
    pending: number;
}) {
    const { t } = useTranslate();

    if (addressed === 0) {
        return (
            <div className="rounded-xl border border-dashed border-foreground/15 bg-background/40 px-4 py-3">
                <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                    {t('stream.end.summary_addressed_zero')}
                </p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'flex items-baseline gap-3 rounded-xl border border-foreground/15 bg-background/60 px-4 py-3',
            )}
        >
            <span className="font-display text-3xl leading-none font-semibold text-foreground tabular-nums">
                {addressed.toString().padStart(2, '0')}
            </span>
            <span className="flex-1 font-mono text-[10px] leading-tight tracking-[0.22em] text-muted-foreground uppercase">
                {t('stream.end.summary_addressed', { count: addressed })}
            </span>
            {pending > 0 ? (
                <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--accent-ink)] uppercase">
                    <span className="tabular-nums">
                        {pending.toString().padStart(2, '0')}
                    </span>{' '}
                    {t('stream.addressed.awaiting_source')}
                </span>
            ) : null}
        </div>
    );
}
