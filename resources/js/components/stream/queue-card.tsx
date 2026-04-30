import { router } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { showQuestion as showSessionQuestion } from '@/routes/stream';
import type { StreamQuestion } from '@/types/stream';

type Props = {
    question: StreamQuestion;
    index: number;
    teamSlug: string;
    sessionId: number;
    canManage: boolean;
};

/**
 * One row in the queue list. Pressing "Show now" jumps the question to
 * `current_question_id` directly via `stream.show-question` — useful when
 * the operator wants to leapfrog a hot take ahead of the natural order.
 */
export function QueueCard({
    question,
    index,
    teamSlug,
    sessionId,
    canManage,
}: Props) {
    const { t } = useTranslate();
    const author =
        question.authorName?.trim() ?? t('dashboard.author.anonymous');

    const showNow = () => {
        if (!canManage) {
            return;
        }

        router.post(
            showSessionQuestion([teamSlug, sessionId, question.id]).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success(t('stream.toast.shown')),
                onError: () => toast.error(t('stream.toast.failed')),
            },
        );
    };

    return (
        <article
            className={cn(
                'group relative flex items-start gap-3 rounded-xl border border-border/70 bg-card/85 p-3 sm:p-3.5',
                'transition-[border-color,background-color] hover:border-foreground/30 hover:bg-card',
            )}
        >
            <span
                aria-hidden="true"
                className="font-mono text-[10px] tracking-[0.22em] text-foreground/40 tabular-nums"
            >
                {index.toString().padStart(2, '0')}
            </span>

            <div className="min-w-0 flex-1">
                <p className="font-display line-clamp-2 text-sm leading-snug text-foreground sm:text-[15px]">
                    {question.body}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
                    <span className="text-foreground/65">— {author}</span>
                    {question.list ? (
                        <>
                            <span aria-hidden="true" className="text-border">
                                /
                            </span>
                            <span className="truncate normal-case">
                                {question.list.name}
                            </span>
                        </>
                    ) : null}
                </p>
            </div>

            <button
                type="button"
                onClick={showNow}
                disabled={!canManage}
                className={cn(
                    'inline-flex min-h-[40px] shrink-0 items-center gap-1 rounded-full',
                    'border border-foreground/20 bg-background/70 px-3 py-1.5',
                    'font-mono text-[10px] tracking-[0.22em] text-foreground/85 uppercase',
                    'transition-[border-color,background-color] hover:border-foreground/55 hover:bg-foreground hover:text-background',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                )}
            >
                {t('stream.show.queue_show_now')}
                <ArrowUpRight
                    className="size-3 transition-transform group-hover:translate-x-px group-hover:-translate-y-px"
                    aria-hidden="true"
                />
            </button>
        </article>
    );
}
