import { router, useForm } from '@inertiajs/react';
import { ChevronDown, Pencil, RefreshCcw, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { OverlayUrlField } from '@/components/stream/overlay-url-field';
import { PresetPicker } from '@/components/stream/preset-picker';
import { Spinner } from '@/components/ui/spinner';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
    destroy as destroySession,
    regenerateToken as regenerateSessionToken,
    update as updateSession,
} from '@/routes/stream';
import type {
    OverlayPreset,
    StreamSession,
    StreamSourceList,
} from '@/types/stream';

type Props = {
    session: StreamSession;
    teamSlug: string;
    lists: StreamSourceList[];
    canManage: boolean;
};

type NameFormShape = { name: string };

/**
 * Backstage panel — collapsed by default so the production room stays
 * focused on the next action. Once open, the operator can rename the
 * session, change source list / preset (PATCH on change), regenerate the
 * token, copy the URL, or end the session.
 */
export function SessionSettingsPanel({
    session,
    teamSlug,
    lists,
    canManage,
}: Props) {
    const { t } = useTranslate();
    const [open, setOpen] = useState(false);
    const [editingName, setEditingName] = useState(false);

    const nameForm = useForm<NameFormShape>({ name: session.name });

    const nameId = useId();
    const listId = useId();

    // "Adjusting state when a prop changes" pattern from React docs:
    // re-sync the local name field after Inertia delivers a new snapshot.
    const [prevName, setPrevName] = useState(session.name);

    if (prevName !== session.name) {
        setPrevName(session.name);
        nameForm.setData('name', session.name);
    }

    const persistName = () => {
        const trimmed = nameForm.data.name.trim();

        if (trimmed === '' || trimmed === session.name) {
            setEditingName(false);

            return;
        }

        nameForm.transform(() => ({ name: trimmed }));
        nameForm.patch(updateSession([teamSlug, session.id]).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('stream.toast.updated'));
                setEditingName(false);
            },
            onError: () => toast.error(t('stream.toast.failed')),
        });
    };

    const submitName = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        persistName();
    };

    const updateList = (next: string) => {
        if (!canManage) {
            return;
        }

        router.patch(
            updateSession([teamSlug, session.id]).url,
            { list_id: next === '' ? null : Number(next) },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(t('stream.toast.updated')),
                onError: () => toast.error(t('stream.toast.failed')),
            },
        );
    };

    const updatePreset = (next: OverlayPreset) => {
        if (!canManage || next === session.overlay_preset) {
            return;
        }

        router.patch(
            updateSession([teamSlug, session.id]).url,
            { overlay_preset: next },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(t('stream.toast.updated')),
                onError: () => toast.error(t('stream.toast.failed')),
            },
        );
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

    const remove = () => {
        if (!canManage) {
            return;
        }

        if (!window.confirm(t('stream.actions.delete_session_confirm'))) {
            return;
        }

        router.delete(destroySession([teamSlug, session.id]).url, {
            preserveScroll: true,
            onSuccess: () => toast.success(t('stream.toast.destroyed')),
            onError: () => toast.error(t('stream.toast.failed')),
        });
    };

    return (
        <section
            className={cn(
                'overflow-hidden rounded-2xl border border-foreground/15 bg-card/80',
                'shadow-[0_1px_0_rgba(0,0,0,0.02)]',
            )}
        >
            <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                aria-expanded={open}
                className={cn(
                    'flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors',
                    'hover:bg-foreground/[0.02]',
                )}
            >
                <span className="flex min-w-0 flex-col">
                    <span className="font-mono text-[10px] tracking-[0.32em] text-foreground/60 uppercase">
                        {t('stream.show.settings_eyebrow')}
                    </span>
                    <span className="font-display mt-0.5 text-base font-semibold text-foreground">
                        {t('stream.show.settings_title')}
                    </span>
                </span>
                <ChevronDown
                    className={cn(
                        'size-4 shrink-0 text-foreground/55 transition-transform',
                        open ? 'rotate-180' : '',
                    )}
                    aria-hidden="true"
                />
            </button>

            {open ? (
                <div className="grid gap-5 border-t border-dashed border-foreground/12 px-4 py-5 sm:px-5">
                    {/* Name */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor={nameId}
                            className="font-mono text-[10px] tracking-[0.28em] text-foreground/60 uppercase"
                        >
                            {t('stream.fields.name_label')}
                        </label>
                        {editingName ? (
                            <form
                                onSubmit={submitName}
                                className="flex items-center gap-2"
                            >
                                <input
                                    id={nameId}
                                    type="text"
                                    autoFocus
                                    maxLength={80}
                                    value={nameForm.data.name}
                                    onChange={(event) =>
                                        nameForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    onBlur={persistName}
                                    className={cn(
                                        'min-h-[40px] flex-1 rounded-lg border border-border/80 bg-background/80 px-3 py-2 text-sm text-foreground',
                                        'focus:border-[var(--accent-ink)] focus:ring-2 focus:ring-[var(--accent-ink)]/25 focus:outline-none',
                                    )}
                                />
                                <button
                                    type="submit"
                                    disabled={nameForm.processing}
                                    className={cn(
                                        'inline-flex min-h-[40px] items-center gap-1 rounded-full px-3 py-1',
                                        'bg-foreground font-mono text-[10px] tracking-[0.22em] text-background uppercase',
                                        'disabled:opacity-50',
                                    )}
                                >
                                    {nameForm.processing ? (
                                        <Spinner className="size-3" />
                                    ) : null}
                                    {t('stream.actions.save_name')}
                                </button>
                            </form>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setEditingName(true)}
                                disabled={!canManage}
                                className={cn(
                                    'group flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5',
                                    'text-left transition-[border-color,background-color] hover:border-foreground/35 hover:bg-card',
                                    'disabled:cursor-not-allowed disabled:opacity-50',
                                )}
                            >
                                <span className="font-display truncate text-base text-foreground">
                                    {session.name}
                                </span>
                                <Pencil
                                    className="size-3.5 text-foreground/40 transition-colors group-hover:text-foreground"
                                    aria-hidden="true"
                                />
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor={listId}
                            className="font-mono text-[10px] tracking-[0.28em] text-foreground/60 uppercase"
                        >
                            {t('stream.fields.list_label')}
                        </label>
                        <select
                            id={listId}
                            value={session.list_id?.toString() ?? ''}
                            onChange={(event) => updateList(event.target.value)}
                            disabled={!canManage}
                            className={cn(
                                'min-h-[40px] rounded-lg border border-border/80 bg-background/80 px-3 py-2 text-sm text-foreground',
                                'focus:border-[var(--accent-ink)] focus:ring-2 focus:ring-[var(--accent-ink)]/25 focus:outline-none',
                                'disabled:cursor-not-allowed disabled:opacity-50',
                            )}
                        >
                            <option value="">
                                {t('stream.fields.list_all_approved')}
                            </option>
                            {lists.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Preset */}
                    <div className="flex flex-col gap-2">
                        <p className="font-mono text-[10px] tracking-[0.28em] text-foreground/60 uppercase">
                            {t('stream.fields.preset_label')}
                        </p>
                        <PresetPicker
                            value={session.overlay_preset}
                            onChange={updatePreset}
                            disabled={!canManage}
                            density="compact"
                        />
                    </div>

                    {/* Overlay URL */}
                    <div className="flex flex-col gap-2">
                        <p className="font-mono text-[10px] tracking-[0.28em] text-foreground/60 uppercase">
                            {t('stream.show.overlay_title')}
                        </p>
                        <OverlayUrlField url={session.overlay_url} />
                    </div>

                    {/* Danger zone */}
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-dashed border-foreground/12 pt-4">
                        <button
                            type="button"
                            onClick={regenerate}
                            disabled={!canManage}
                            className={cn(
                                'inline-flex min-h-[40px] items-center gap-1.5 rounded-full',
                                'border border-foreground/20 bg-background/70 px-3.5 py-1.5 font-mono text-[10px] tracking-[0.22em] text-foreground/80 uppercase',
                                'transition-[border-color,background-color] hover:border-foreground/45 hover:bg-card',
                                'disabled:cursor-not-allowed disabled:opacity-50',
                            )}
                        >
                            <RefreshCcw
                                className="size-3.5"
                                aria-hidden="true"
                            />
                            {t('stream.actions.regenerate_token')}
                        </button>
                        <button
                            type="button"
                            onClick={remove}
                            disabled={!canManage}
                            className={cn(
                                'inline-flex min-h-[40px] items-center gap-1.5 rounded-full',
                                'border border-destructive/40 bg-destructive/[0.04] px-3.5 py-1.5 font-mono text-[10px] tracking-[0.22em] text-destructive uppercase',
                                'transition-[border-color,background-color] hover:border-destructive/70 hover:bg-destructive/[0.08]',
                                'disabled:cursor-not-allowed disabled:opacity-50',
                            )}
                        >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            {t('stream.actions.delete_session')}
                        </button>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
