import { useForm, usePage } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { PlatformColorPalette } from '@/components/questions/platform-color-palette';
import { Spinner } from '@/components/ui/spinner';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store, update } from '@/routes/questions/lists';

type Mode =
    | { kind: 'create' }
    | {
          kind: 'rename';
          listId: number;
          name: string;
          color: string | null;
      };

type Props = {
    mode: Mode;
    onCancel: () => void;
    onSaved: () => void;
};

type FormShape = {
    name: string;
    color: string | null;
};

export function ListComposer({ mode, onCancel, onSaved }: Props) {
    const { t } = useTranslate();
    const inputRef = useRef<HTMLInputElement>(null);
    const teamSlug = usePage().props.currentTeam?.slug ?? '';
    const initial: FormShape =
        mode.kind === 'create'
            ? { name: '', color: null }
            : { name: mode.name, color: mode.color };

    const { data, setData, post, patch, processing, errors } =
        useForm<FormShape>(initial);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (data.name.trim() === '') {
            return;
        }

        const onSuccess = () => {
            toast.success(
                mode.kind === 'create'
                    ? t('questions.list_composer.toast_created')
                    : t('questions.list_composer.toast_updated'),
            );
            onSaved();
        };
        const onError = () => {
            toast.error(t('questions.list_composer.toast_failed'));
        };

        if (mode.kind === 'create') {
            post(store(teamSlug).url, {
                preserveScroll: true,
                preserveState: true,
                onSuccess,
                onError,
            });
        } else {
            patch(update([teamSlug, mode.listId]).url, {
                preserveScroll: true,
                preserveState: true,
                onSuccess,
                onError,
            });
        }
    };

    return (
        <form
            onSubmit={submit}
            className={cn(
                'flex flex-col gap-3 rounded-xl border border-border/70 bg-card/95 p-3.5',
                'shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_-32px_rgba(15,12,8,0.45)]',
            )}
        >
            <div className="flex items-center justify-between gap-2 font-mono text-[9px] tracking-[0.28em] text-muted-foreground uppercase">
                <span className="text-[var(--accent-ink)]">
                    {mode.kind === 'create'
                        ? t('questions.list_composer.new_list')
                        : t('questions.list_composer.rename_list')}
                </span>
            </div>

            <input
                ref={inputRef}
                type="text"
                value={data.name}
                onChange={(event) => setData('name', event.target.value)}
                maxLength={64}
                required
                placeholder={t('questions.list_composer.name_placeholder')}
                aria-invalid={Boolean(errors.name)}
                className={cn(
                    'font-display min-h-[40px] rounded-lg border border-border/80 bg-background/80 px-3 py-2',
                    'text-base text-foreground placeholder:text-muted-foreground/60',
                    'transition-colors focus:border-[var(--accent-ink)] focus:ring-2 focus:ring-[var(--accent-ink)]/25 focus:outline-none',
                )}
            />
            {errors.name ? (
                <p className="text-[11px] text-destructive">{errors.name}</p>
            ) : null}

            <PlatformColorPalette
                value={data.color}
                onChange={(value) => setData('color', value)}
            />

            <div className="flex items-center justify-end gap-1.5 pt-0.5">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={processing}
                    className={cn(
                        'inline-flex min-h-[32px] items-center gap-1 rounded-full px-2.5 py-1',
                        'font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase hover:text-foreground',
                        'disabled:opacity-50',
                    )}
                >
                    <X className="size-3" />
                    {t('common.actions.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={processing || data.name.trim() === ''}
                    className={cn(
                        'inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 py-1',
                        'bg-foreground font-mono text-[10px] tracking-[0.22em] text-background uppercase',
                        'transition-transform hover:-translate-y-0.5',
                        'disabled:pointer-events-none disabled:opacity-50',
                    )}
                >
                    {processing ? (
                        <Spinner className="size-3" />
                    ) : (
                        <Check className="size-3" strokeWidth={3} />
                    )}
                    {mode.kind === 'create'
                        ? t('questions.list_composer.create')
                        : t('questions.list_composer.save')}
                </button>
            </div>
        </form>
    );
}
