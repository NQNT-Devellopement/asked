import { useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { toast } from 'sonner';
import { PresetPicker } from '@/components/stream/preset-picker';
import { Spinner } from '@/components/ui/spinner';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store as storeSession } from '@/routes/stream';
import type { OverlayPreset, StreamSourceList } from '@/types/stream';

type Props = {
    teamSlug: string;
    lists: StreamSourceList[];
    onCancel: () => void;
};

type FormShape = {
    name: string;
    list_id: string;
    overlay_preset: OverlayPreset;
};

/**
 * Inline composer for new stream sessions. Posts to `stream.store` and
 * lets the controller's redirect drop the operator straight onto the
 * control panel — same pattern the inbox / answer flow uses.
 */
export function SessionComposer({ teamSlug, lists, onCancel }: Props) {
    const { t } = useTranslate();
    const nameInputRef = useRef<HTMLInputElement>(null);
    const nameId = useId();
    const listId = useId();
    const presetId = useId();

    const { data, setData, post, processing, errors } = useForm<FormShape>({
        name: '',
        list_id: '',
        overlay_preset: 'editorial',
    });

    useEffect(() => {
        nameInputRef.current?.focus();
    }, []);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (data.name.trim() === '') {
            return;
        }

        post(storeSession(teamSlug).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('stream.toast.created'));
            },
            onError: () => {
                toast.error(t('stream.toast.create_failed'));
            },
        });
    };

    return (
        <form
            onSubmit={submit}
            className={cn(
                'relative isolate overflow-hidden rounded-2xl border border-foreground/15 bg-card/80 p-5 sm:p-6',
                'shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_50px_-44px_rgba(15,12,8,0.6)]',
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,_var(--rule-strong)_1px,_transparent_0)] [background-size:18px_18px] opacity-30"
            />

            <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                    <span className="inline-flex items-center gap-2">
                        <span
                            aria-hidden="true"
                            className="inline-block size-1.5 rounded-full bg-[var(--accent-ink)]"
                        />
                        {t('stream.composer.eyebrow')}
                    </span>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex min-h-[32px] items-center gap-1 rounded-full px-2.5 py-1 text-foreground/55 hover:text-foreground"
                    >
                        <X className="size-3" aria-hidden="true" />
                        {t('stream.composer.cancel')}
                    </button>
                </div>

                <h2 className="font-display mt-2 text-2xl leading-tight font-semibold text-foreground sm:text-3xl">
                    {t('stream.composer.title')}
                </h2>

                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor={nameId}
                            className="font-mono text-[10px] tracking-[0.28em] text-foreground/60 uppercase"
                        >
                            {t('stream.composer.name_label')}
                        </label>
                        <input
                            id={nameId}
                            ref={nameInputRef}
                            type="text"
                            required
                            maxLength={80}
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            placeholder={t('stream.composer.name_placeholder')}
                            aria-invalid={Boolean(errors.name)}
                            className={cn(
                                'min-h-[44px] rounded-lg border bg-background/80 px-3 py-2 text-base text-foreground',
                                'transition-colors focus:border-[var(--accent-ink)] focus:ring-2 focus:ring-[var(--accent-ink)]/25 focus:outline-none',
                                errors.name
                                    ? 'border-destructive'
                                    : 'border-border/80',
                            )}
                        />
                        {errors.name ? (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor={listId}
                            className="font-mono text-[10px] tracking-[0.28em] text-foreground/60 uppercase"
                        >
                            {t('stream.composer.list_label')}
                        </label>
                        <select
                            id={listId}
                            value={data.list_id}
                            onChange={(event) =>
                                setData('list_id', event.target.value)
                            }
                            className={cn(
                                'min-h-[44px] rounded-lg border border-border/80 bg-background/80 px-3 py-2 text-base text-foreground',
                                'transition-colors focus:border-[var(--accent-ink)] focus:ring-2 focus:ring-[var(--accent-ink)]/25 focus:outline-none',
                            )}
                        >
                            <option value="">
                                {t('stream.composer.list_all_approved')}
                            </option>
                            {lists.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-5">
                    <p
                        id={presetId}
                        className="font-mono text-[10px] tracking-[0.28em] text-foreground/60 uppercase"
                    >
                        {t('stream.composer.preset_label')}
                    </p>
                    <div className="mt-2">
                        <PresetPicker
                            value={data.overlay_preset}
                            onChange={(next) => setData('overlay_preset', next)}
                            disabled={processing}
                        />
                    </div>
                    {errors.overlay_preset ? (
                        <p className="mt-2 text-xs text-destructive">
                            {errors.overlay_preset}
                        </p>
                    ) : null}
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                        type="submit"
                        disabled={processing || data.name.trim() === ''}
                        className={cn(
                            'inline-flex min-h-[44px] items-center gap-2 rounded-full bg-foreground px-5 py-2',
                            'font-mono text-[11px] tracking-[0.22em] text-background uppercase',
                            'transition-transform hover:-translate-y-0.5',
                            'disabled:pointer-events-none disabled:opacity-50',
                        )}
                    >
                        {processing ? (
                            <Spinner className="size-3.5" />
                        ) : (
                            <Plus className="size-4" aria-hidden="true" />
                        )}
                        {t('stream.composer.submit')}
                    </button>
                </div>
            </div>
        </form>
    );
}
