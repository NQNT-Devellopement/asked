import { useForm } from '@inertiajs/react';
import { Check, Link2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { PlatformIcon, platformLabel } from '@/components/faq/platform-icon';
import { Spinner } from '@/components/ui/spinner';
import { useTranslate } from '@/lib/i18n';
import { detectPlatform, isLikelyUrl } from '@/lib/platform-detect';
import { cn } from '@/lib/utils';
import { applySource as applySessionSource } from '@/routes/stream';

type Props = {
    teamSlug: string;
    sessionId: number;
    /**
     * When provided, the composer applies the URL only to those question
     * IDs (per-question override). When omitted, the URL is bulk-applied to
     * every addressed question of the session.
     */
    questionIds?: number[];
    initialUrl?: string | null;
    initialLabel?: string | null;
    onCancel: () => void;
    onSaved: () => void;
    submitLabel?: string;
};

type FormShape = {
    source_url: string;
    source_label: string;
    question_ids: number[] | null;
};

/**
 * Inline URL+label form used both for bulk apply ("Apply URL to all")
 * and per-question override ("Override URL"). Mirrors the desk's answer
 * composer so the operator's muscle memory carries over from the
 * questions board.
 */
export function ApplySourceComposer({
    teamSlug,
    sessionId,
    questionIds,
    initialUrl,
    initialLabel,
    onCancel,
    onSaved,
    submitLabel,
}: Props) {
    const { t } = useTranslate();
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } =
        useForm<FormShape>({
            source_url: initialUrl ?? '',
            source_label: initialLabel ?? '',
            question_ids: questionIds ?? null,
        });

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const platform = detectPlatform(data.source_url);
    const valid = isLikelyUrl(data.source_url);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!valid) {
            return;
        }

        post(applySessionSource([teamSlug, sessionId]).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('stream.toast.source_applied'));
                reset();
                onSaved();
            },
            onError: () => {
                toast.error(t('stream.toast.source_apply_failed'));
            },
        });
    };

    return (
        <form
            onSubmit={submit}
            className="flex flex-col gap-2.5 font-mono text-[10px]"
        >
            <div className="flex items-center justify-between gap-2 tracking-[0.28em] text-muted-foreground uppercase">
                <span className="text-[var(--accent-ink)]">
                    {t('questions.answer_composer.receipt')}
                </span>
                <span className="flex items-center gap-1.5 text-foreground/55">
                    <span
                        className={cn(
                            'inline-flex size-4 items-center justify-center rounded-sm',
                            valid
                                ? 'bg-[var(--accent-ink)]/12 text-[var(--accent-ink)]'
                                : 'bg-foreground/5 text-foreground/40',
                        )}
                    >
                        <PlatformIcon platform={platform} className="size-3" />
                    </span>
                    <span className="tabular-nums">
                        {valid
                            ? platformLabel(platform)
                            : t('questions.answer_composer.no_platform')}
                    </span>
                </span>
            </div>

            <div
                className={cn(
                    'group relative flex items-center rounded-lg border bg-background/80 transition-colors',
                    'focus-within:border-[var(--accent-ink)] focus-within:ring-2 focus-within:ring-[var(--accent-ink)]/25',
                    errors.source_url
                        ? 'border-destructive'
                        : 'border-border/80',
                )}
            >
                <Link2
                    className="ml-3 size-3.5 text-foreground/40"
                    aria-hidden="true"
                />
                <input
                    ref={inputRef}
                    type="url"
                    inputMode="url"
                    required
                    value={data.source_url}
                    onChange={(event) =>
                        setData('source_url', event.target.value)
                    }
                    placeholder={t('stream.end.url_placeholder')}
                    aria-invalid={Boolean(errors.source_url)}
                    className={cn(
                        'min-h-[40px] flex-1 bg-transparent px-2 py-2 text-xs tracking-normal text-foreground outline-none placeholder:text-muted-foreground/60',
                    )}
                />
            </div>

            <input
                type="text"
                maxLength={120}
                value={data.source_label}
                onChange={(event) =>
                    setData('source_label', event.target.value)
                }
                placeholder={t('stream.end.label_placeholder')}
                aria-invalid={Boolean(errors.source_label)}
                className={cn(
                    'min-h-[36px] rounded-lg border border-border/70 bg-background/60 px-3 py-1.5',
                    'text-xs tracking-normal text-foreground placeholder:text-muted-foreground/60',
                    'transition-colors focus:border-[var(--accent-ink)] focus:ring-2 focus:ring-[var(--accent-ink)]/25 focus:outline-none',
                )}
            />

            {errors.source_url ? (
                <p className="text-[10px] tracking-normal text-destructive normal-case">
                    {errors.source_url}
                </p>
            ) : null}

            <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={processing}
                    className={cn(
                        'inline-flex min-h-[32px] items-center gap-1 rounded-full px-2.5 py-1',
                        'tracking-[0.22em] text-muted-foreground uppercase hover:text-foreground',
                        'disabled:opacity-50',
                    )}
                >
                    <X className="size-3" />
                    {t('common.actions.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={!valid || processing}
                    className={cn(
                        'inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 py-1',
                        'bg-[var(--accent-ink)] tracking-[0.22em] text-[var(--accent-foreground)] uppercase shadow-sm',
                        'transition-transform hover:-translate-y-0.5',
                        'disabled:pointer-events-none disabled:opacity-50',
                    )}
                >
                    {processing ? (
                        <Spinner className="size-3" />
                    ) : (
                        <Check className="size-3" strokeWidth={3} />
                    )}
                    {submitLabel ?? t('questions.answer_composer.file_it')}
                </button>
            </div>
        </form>
    );
}
