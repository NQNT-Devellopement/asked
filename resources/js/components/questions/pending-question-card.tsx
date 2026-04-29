import { useForm, usePage } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { moderate } from '@/routes/questions';

export type PendingQuestion = {
    id: number;
    body: string;
    authorName: string | null;
    createdAt: string;
    submitterIpHash: string | null;
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

type Props = {
    question: PendingQuestion;
    index: number;
    canModerate: boolean;
    onResolved: (id: number) => void;
};

type ModerationForm = { decision: 'approve' | 'reject' };

export function PendingQuestionCard({
    question,
    index,
    canModerate,
    onResolved,
}: Props) {
    const { t, locale } = useTranslate();
    const [confirmReject, setConfirmReject] = useState(false);
    const [outgoing, setOutgoing] = useState<'approve' | 'reject' | null>(null);
    const author = question.authorName?.trim() || null;
    const teamSlug = usePage().props.currentTeam?.slug ?? '';

    const form = useForm<ModerationForm>({ decision: 'approve' });

    const submit = (decision: 'approve' | 'reject') => {
        if (!canModerate || form.processing || outgoing) {
            return;
        }

        setOutgoing(decision);
        form.transform(() => ({ decision }));
        form.patch(moderate([teamSlug, question.id]).url, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(
                    decision === 'approve'
                        ? t('questions.pending_card.toast_approved')
                        : t('questions.pending_card.toast_spiked'),
                );
                onResolved(question.id);
            },
            onError: () => {
                setOutgoing(null);
                toast.error(t('questions.pending_card.toast_failed'));
            },
        });
    };

    return (
        <article
            data-outgoing={outgoing ?? undefined}
            className={cn(
                'group relative isolate overflow-hidden rounded-2xl border border-border/70 bg-card/85',
                'shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_60px_-44px_rgba(15,12,8,0.5)]',
                'transition-[opacity,transform,filter] duration-300 ease-out',
                'data-[outgoing=approve]:translate-x-[40%] data-[outgoing=approve]:opacity-0 data-[outgoing=approve]:blur-[1px]',
                'data-[outgoing=reject]:-translate-x-[40%] data-[outgoing=reject]:opacity-0 data-[outgoing=reject]:blur-[1px]',
            )}
        >
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
                <aside className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                    <span
                        aria-hidden="true"
                        className="font-display text-2xl leading-none font-medium text-foreground/30 italic tabular-nums sm:text-4xl"
                    >
                        {t('questions.pending_card.number', {
                            number: index.toString().padStart(3, '0'),
                        })}
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.28em] text-muted-foreground uppercase">
                        {t('questions.pending_card.incoming_label')}
                    </span>
                </aside>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                        <span className="text-foreground/75">
                            {author ? (
                                <>
                                    <span aria-hidden="true">
                                        {t('questions.pending_card.from')}
                                        &nbsp;
                                    </span>
                                    <span className="text-foreground">
                                        {author}
                                    </span>
                                </>
                            ) : (
                                <span className="text-foreground/55 italic">
                                    {t('questions.pending_card.anonymous')}
                                </span>
                            )}
                        </span>
                        <span aria-hidden="true" className="text-border">
                            /
                        </span>
                        <time
                            dateTime={question.createdAt}
                            className="text-foreground/65"
                        >
                            {formatRelative(
                                question.createdAt,
                                locale,
                                t('questions.time.just_now'),
                            )}
                        </time>
                        {question.submitterIpHash ? (
                            <>
                                <span
                                    aria-hidden="true"
                                    className="text-border"
                                >
                                    /
                                </span>
                                <span
                                    title={t(
                                        'questions.pending_card.submitter_signature_title',
                                    )}
                                    className="rounded-sm border border-dashed border-border/80 bg-muted/30 px-1.5 py-px text-[9px] tracking-[0.16em] text-foreground/55"
                                >
                                    {question.submitterIpHash}
                                </span>
                            </>
                        ) : null}
                    </div>

                    <p className="font-display mt-3 text-lg leading-snug text-balance text-foreground sm:text-xl">
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
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <button
                        type="button"
                        onClick={() => submit('approve')}
                        disabled={!canModerate || form.processing || !!outgoing}
                        className={cn(
                            'group/btn inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full',
                            'bg-foreground/95 px-4 py-2 text-sm font-medium text-background',
                            'shadow-[0_1px_0_rgba(255,255,255,0.18)_inset]',
                            'transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-foreground',
                            'disabled:pointer-events-none disabled:opacity-50',
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className="flex size-5 items-center justify-center rounded-full bg-[var(--accent-ink)] text-[var(--accent-foreground)]"
                        >
                            <Check className="size-3" strokeWidth={3} />
                        </span>
                        {t('questions.pending_card.approve')}
                    </button>
                    {confirmReject ? (
                        <div className="flex items-center gap-1.5 rounded-full border border-[color:var(--stamp-ink)]/30 bg-[var(--stamp-ink)]/5 p-1 pl-3">
                            <span className="font-mono text-[10px] tracking-[0.18em] text-[color:var(--stamp-ink)] uppercase">
                                {t('questions.pending_card.spike_question')}
                            </span>
                            <button
                                type="button"
                                onClick={() => submit('reject')}
                                disabled={
                                    !canModerate ||
                                    form.processing ||
                                    !!outgoing
                                }
                                className={cn(
                                    'inline-flex min-h-[36px] items-center gap-1.5 rounded-full',
                                    'bg-[var(--stamp-ink)] px-3 py-1.5 text-xs font-medium text-white',
                                    'transition-transform hover:-translate-y-0.5',
                                    'disabled:pointer-events-none disabled:opacity-50',
                                )}
                            >
                                <X className="size-3" strokeWidth={3} />
                                {t('questions.pending_card.confirm')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmReject(false)}
                                className="inline-flex min-h-[32px] items-center gap-1 rounded-full px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase hover:text-foreground"
                            >
                                {t('questions.pending_card.keep')}
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmReject(true)}
                            disabled={
                                !canModerate || form.processing || !!outgoing
                            }
                            className={cn(
                                'inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2',
                                'border border-dashed border-border/80 bg-transparent text-sm font-medium text-foreground/75',
                                'transition-[border-color,color,background-color] hover:border-[color:var(--stamp-ink)]/40 hover:bg-[var(--stamp-ink)]/5 hover:text-[color:var(--stamp-ink)]',
                                'disabled:pointer-events-none disabled:opacity-50',
                            )}
                        >
                            <X className="size-4" strokeWidth={2.4} />
                            {t('questions.pending_card.spike')}
                        </button>
                    )}
                </div>
            </div>

            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/70 to-transparent"
            />
        </article>
    );
}
