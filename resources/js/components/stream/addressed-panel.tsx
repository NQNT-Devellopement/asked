import { Link2 } from 'lucide-react';
import { useState } from 'react';
import { DeskSlug } from '@/components/questions/desk-chrome';
import { AddressedRow } from '@/components/stream/addressed-row';
import { ApplySourceComposer } from '@/components/stream/apply-source-composer';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { StreamQuestion } from '@/types/stream';

type Props = {
    questions: StreamQuestion[];
    teamSlug: string;
    sessionId: number;
    canManage: boolean;
};

/**
 * The post-session "Addressed" panel. Always visible — works during
 * the live as a running tally and post-session as the retroactive
 * source-attribution surface. Operators can either bulk-apply one URL
 * to every still-pending question, or override URLs per-row.
 */
export function AddressedPanel({
    questions,
    teamSlug,
    sessionId,
    canManage,
}: Props) {
    const { t } = useTranslate();
    const [bulkOpen, setBulkOpen] = useState(false);

    const pendingCount = questions.filter(
        (q) => q.answerSource === null,
    ).length;
    const hasPending = pendingCount > 0;

    return (
        <section
            className={cn(
                'overflow-hidden rounded-2xl border border-foreground/15 bg-card/70',
                'shadow-[0_1px_0_rgba(0,0,0,0.02)]',
            )}
        >
            <header className="flex flex-col gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <DeskSlug
                            label={t('stream.addressed.eyebrow')}
                            count={questions.length}
                            accent={questions.length > 0}
                        />
                        <h2 className="font-display mt-1.5 text-xl leading-tight font-semibold text-foreground sm:text-2xl">
                            {t('stream.addressed.title')}
                        </h2>
                    </div>
                    {hasPending ? (
                        <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                            <span className="text-[var(--accent-ink)] tabular-nums">
                                {pendingCount.toString().padStart(2, '0')}
                            </span>
                            {' / '}
                            <span className="tabular-nums">
                                {questions.length.toString().padStart(2, '0')}
                            </span>{' '}
                            <span>{t('stream.addressed.awaiting_source')}</span>
                        </span>
                    ) : null}
                </div>

                {hasPending && canManage ? (
                    !bulkOpen ? (
                        <button
                            type="button"
                            onClick={() => setBulkOpen(true)}
                            className={cn(
                                'group inline-flex w-full items-center justify-between gap-2 rounded-xl',
                                'border border-[var(--accent-ink)]/45 bg-[var(--accent-ink)]/[0.06] px-3.5 py-2.5',
                                'transition-[border-color,background-color]',
                                'hover:border-[var(--accent-ink)] hover:bg-[var(--accent-ink)]/[0.12]',
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <span
                                    aria-hidden="true"
                                    className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--accent-ink)]/20 text-[var(--accent-ink)]"
                                >
                                    <Link2 className="size-3.5" />
                                </span>
                                <span className="flex flex-col items-start">
                                    <span className="font-display text-sm font-semibold text-foreground sm:text-base">
                                        {t('stream.actions.apply_url_to_all')}
                                    </span>
                                    <span className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
                                        {t(
                                            'stream.addressed.apply_url_to_all_help',
                                        )}
                                    </span>
                                </span>
                            </span>
                            <span
                                aria-hidden="true"
                                className="font-display text-2xl text-[var(--accent-ink)] transition-transform group-hover:translate-x-px"
                            >
                                →
                            </span>
                        </button>
                    ) : (
                        <div className="rounded-xl border border-[var(--accent-ink)]/40 bg-[var(--accent-ink)]/[0.04] p-3">
                            <p className="mb-2 font-mono text-[9px] tracking-[0.28em] text-foreground/65 uppercase">
                                {t('stream.actions.apply_url_to_all')}
                            </p>
                            <ApplySourceComposer
                                teamSlug={teamSlug}
                                sessionId={sessionId}
                                onCancel={() => setBulkOpen(false)}
                                onSaved={() => setBulkOpen(false)}
                                submitLabel={t(
                                    'stream.actions.apply_url_to_all',
                                )}
                            />
                        </div>
                    )
                ) : null}
            </header>

            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                {questions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-foreground/15 bg-background/40 px-4 py-7 text-center">
                        <p className="font-display text-base text-foreground/70">
                            {t('stream.addressed.empty')}
                        </p>
                        <p className="mt-1 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                            {t('stream.addressed.empty_hint')}
                        </p>
                    </div>
                ) : (
                    <ol className="flex flex-col gap-2.5">
                        {questions.map((question) => (
                            <li key={question.id}>
                                <AddressedRow
                                    question={question}
                                    teamSlug={teamSlug}
                                    sessionId={sessionId}
                                    canManage={canManage}
                                />
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
}
