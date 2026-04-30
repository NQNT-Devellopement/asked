import { ExternalLink, Pencil } from 'lucide-react';
import { useState } from 'react';
import { PlatformIcon, platformLabel } from '@/components/faq/platform-icon';
import { ApplySourceComposer } from '@/components/stream/apply-source-composer';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { StreamQuestion } from '@/types/stream';

type Props = {
    question: StreamQuestion;
    teamSlug: string;
    sessionId: number;
    canManage: boolean;
};

/**
 * One row in the post-session "Addressed" panel. Shows status (awaiting
 * source / source attached) and lets the streamer override the URL on a
 * per-question basis. Override opens an inline ApplySourceComposer that
 * POSTs to `stream.apply-source` with `question_ids: [thisId]`.
 */
export function AddressedRow({
    question,
    teamSlug,
    sessionId,
    canManage,
}: Props) {
    const { t } = useTranslate();
    const [overriding, setOverriding] = useState(false);

    const author =
        question.authorName?.trim() ?? t('dashboard.author.anonymous');
    const source = question.answerSource;

    return (
        <article
            className={cn(
                'group relative rounded-xl border border-border/70 bg-card/85 p-3 sm:p-3.5',
                'transition-[border-color,background-color]',
                source
                    ? 'hover:border-foreground/30'
                    : 'hover:border-[var(--accent-ink)]/45',
            )}
        >
            <div className="flex items-start gap-3">
                <span
                    aria-hidden="true"
                    className={cn(
                        'mt-1 inline-flex size-1.5 shrink-0 rounded-full',
                        source ? 'bg-[var(--accent-ink)]' : 'bg-foreground/30',
                    )}
                />

                <div className="min-w-0 flex-1">
                    <p className="font-display line-clamp-2 text-sm leading-snug text-foreground sm:text-[15px]">
                        {question.body}
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
                        <span className="text-foreground/65">— {author}</span>
                        {question.list ? (
                            <>
                                <span
                                    aria-hidden="true"
                                    className="text-border"
                                >
                                    /
                                </span>
                                <span className="truncate normal-case">
                                    {question.list.name}
                                </span>
                            </>
                        ) : null}
                    </p>
                </div>

                <SourceBadge question={question} />
            </div>

            {!overriding && canManage ? (
                <div className="mt-2.5 flex items-center justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={() => setOverriding(true)}
                        className={cn(
                            'inline-flex min-h-[28px] items-center gap-1 rounded-full',
                            'border border-foreground/15 bg-background/60 px-2.5 py-1',
                            'font-mono text-[9px] tracking-[0.22em] text-foreground/70 uppercase',
                            'transition-[border-color,background-color,color]',
                            'hover:border-foreground/45 hover:bg-card hover:text-foreground',
                        )}
                    >
                        <Pencil className="size-3" aria-hidden="true" />
                        {source
                            ? t('stream.actions.override_url')
                            : t('stream.actions.answer_with_url_now')}
                    </button>
                </div>
            ) : null}

            {overriding ? (
                <div className="mt-3 rounded-lg border border-dashed border-foreground/15 bg-background/40 p-3">
                    <p className="mb-2 font-mono text-[9px] tracking-[0.22em] text-foreground/55 uppercase">
                        {t('stream.addressed.override_help')}
                    </p>
                    <ApplySourceComposer
                        teamSlug={teamSlug}
                        sessionId={sessionId}
                        questionIds={[question.id]}
                        initialUrl={source?.url}
                        initialLabel={source?.label}
                        onCancel={() => setOverriding(false)}
                        onSaved={() => setOverriding(false)}
                    />
                </div>
            ) : null}
        </article>
    );
}

function SourceBadge({ question }: { question: StreamQuestion }) {
    const { t } = useTranslate();
    const source = question.answerSource;

    if (!source) {
        return (
            <span
                className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded-full',
                    'border border-dashed border-foreground/25 bg-background/50 px-2 py-0.5',
                    'font-mono text-[9px] tracking-[0.22em] text-foreground/55 uppercase',
                )}
            >
                <span
                    aria-hidden="true"
                    className="inline-block size-1 rounded-full bg-foreground/40"
                />
                {t('stream.addressed.awaiting_source')}
            </span>
        );
    }

    const platform = source.platform ?? 'website';

    return (
        <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full',
                'border border-[var(--accent-ink)]/45 bg-[var(--accent-ink)]/[0.08] px-2 py-0.5',
                'font-mono text-[9px] tracking-[0.22em] text-foreground/85 uppercase',
                'transition-[border-color,background-color] hover:border-[var(--accent-ink)] hover:bg-[var(--accent-ink)]/[0.14]',
            )}
            title={source.url}
        >
            <PlatformIcon
                platform={platform}
                className="size-2.5 text-[var(--accent-ink)]"
            />
            {platformLabel(platform)}
            <ExternalLink
                className="size-2.5 text-foreground/55"
                aria-hidden="true"
            />
        </a>
    );
}
