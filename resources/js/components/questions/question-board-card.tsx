import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ArrowUpRight,
    GripVertical,
    Hourglass,
    MoreHorizontal,
    Pencil,
    SquarePen,
    Trash2,
    Undo2,
} from 'lucide-react';
import { PlatformIcon, platformLabel } from '@/components/faq/platform-icon';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { BoardQuestion } from '@/types/questions-board';

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
    question: BoardQuestion;
    accent: string | null;
    canManage: boolean;
    canModerate: boolean;
    isComposing: boolean;
    moveTargets: Array<{ id: number | null; name: string }>;
    onAnswer: () => void;
    onUnanswer: () => void;
    onDelete: () => void;
    onMoveTo: (listId: number | null) => void;
    composer: React.ReactNode;
};

export function QuestionBoardCard({
    question,
    accent,
    canManage,
    canModerate,
    isComposing,
    moveTargets,
    onAnswer,
    onUnanswer,
    onDelete,
    onMoveTo,
    composer,
}: Props) {
    const { t, locale } = useTranslate();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `q:${question.id}`,
        data: { kind: 'question', listId: question.list?.id ?? null },
        disabled: !canManage || isComposing,
    });

    const isAnswered = question.status === 'answered';
    const author = question.authorName?.trim() || t('questions.card.anonymous');

    return (
        <article
            ref={setNodeRef}
            style={{
                transform: CSS.Translate.toString(transform),
                transition,
            }}
            data-dragging={isDragging || undefined}
            className={cn(
                'group/card relative isolate flex flex-col gap-3 overflow-hidden rounded-xl border border-border/70 bg-card/95',
                'shadow-[0_1px_0_rgba(0,0,0,0.02),0_14px_30px_-26px_rgba(15,12,8,0.45)]',
                'transition-[box-shadow,border-color] hover:border-foreground/30',
                'data-[dragging=true]:rotate-[-1deg] data-[dragging=true]:opacity-90 data-[dragging=true]:shadow-[0_24px_40px_-24px_rgba(15,12,8,0.5)]',
            )}
        >
            {accent ? (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-3 left-0 w-[2px] rounded-r-full"
                    style={{ backgroundColor: accent }}
                />
            ) : null}

            <header className="flex items-start gap-2 px-4 pt-3">
                {canManage ? (
                    <button
                        type="button"
                        aria-label={t('questions.list_column.drag_question')}
                        {...attributes}
                        {...listeners}
                        className={cn(
                            'mt-0.5 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center',
                            'rounded text-foreground/30 transition-colors hover:text-foreground/70',
                            'active:cursor-grabbing',
                        )}
                    >
                        <GripVertical className="size-3.5" aria-hidden="true" />
                    </button>
                ) : (
                    <span className="size-6 shrink-0" aria-hidden="true" />
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
                        <span className="text-foreground/55 tabular-nums">
                            #{question.id}
                        </span>
                        <span aria-hidden="true" className="text-border">
                            /
                        </span>
                        {isAnswered ? (
                            <span className="inline-flex items-center gap-1 text-[var(--accent-ink)]">
                                <span className="size-1 rounded-full bg-[var(--accent-ink)]" />
                                {t('questions.card.answered')}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-foreground/55">
                                <Hourglass
                                    className="size-2.5"
                                    aria-hidden="true"
                                />
                                {t('questions.card.on_the_list')}
                            </span>
                        )}
                    </div>
                </div>

                {canManage ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={cn(
                                'flex size-7 items-center justify-center rounded-md text-foreground/40',
                                'transition-colors hover:bg-foreground/[0.04] hover:text-foreground/80',
                                'opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100',
                            )}
                            aria-label={t('questions.card.question_actions')}
                        >
                            <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="min-w-[200px]"
                        >
                            {isAnswered ? (
                                <DropdownMenuItem onSelect={onAnswer}>
                                    <SquarePen className="size-3.5" />
                                    {t('questions.card.edit_answer')}
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onSelect={onAnswer}>
                                    <Pencil className="size-3.5" />
                                    {t('questions.card.mark_answered')}
                                </DropdownMenuItem>
                            )}
                            {isAnswered ? (
                                <DropdownMenuItem onSelect={onUnanswer}>
                                    <Undo2 className="size-3.5" />
                                    {t('questions.card.revert_to_approved')}
                                </DropdownMenuItem>
                            ) : null}
                            {moveTargets.length > 0 ? (
                                <>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1.5 font-mono text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
                                        {t('questions.card.move_to')}
                                    </div>
                                    {moveTargets.map((target) => (
                                        <DropdownMenuItem
                                            key={target.id ?? 'unsorted'}
                                            onSelect={() => onMoveTo(target.id)}
                                        >
                                            <span className="size-3.5" />
                                            {target.name}
                                        </DropdownMenuItem>
                                    ))}
                                </>
                            ) : null}
                            {canModerate ? (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={onDelete}
                                    >
                                        <Trash2 className="size-3.5" />
                                        {t('questions.card.delete_question')}
                                    </DropdownMenuItem>
                                </>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
            </header>

            <p className="font-display px-4 text-[15px] leading-snug text-balance text-foreground">
                {question.body}
            </p>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-border/70 px-4 py-2.5 text-xs text-muted-foreground">
                <div className="flex min-w-0 items-center gap-2">
                    <span
                        aria-hidden="true"
                        className="font-display inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-[10px] font-medium text-foreground/70"
                    >
                        {author.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate font-mono text-[10px] tracking-[0.16em]">
                        <span className="text-foreground/75">{author}</span>
                        <span aria-hidden="true" className="mx-1.5 text-border">
                            &middot;
                        </span>
                        <time
                            dateTime={
                                isAnswered && question.answeredAt
                                    ? question.answeredAt
                                    : question.createdAt
                            }
                        >
                            {formatRelative(
                                isAnswered && question.answeredAt
                                    ? question.answeredAt
                                    : question.createdAt,
                                locale,
                                t('questions.time.just_now'),
                            )}
                        </time>
                    </span>
                </div>

                {isAnswered && question.answerSource ? (
                    <a
                        href={question.answerSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'group/link inline-flex min-h-[28px] items-center gap-1 rounded-full',
                            'border border-foreground/10 bg-foreground/[0.04] px-2 py-0.5 text-[11px] font-medium text-foreground',
                            'transition-colors hover:border-[var(--accent-ink)]/40 hover:bg-[var(--accent-ink)]/10 hover:text-[var(--accent-ink)]',
                        )}
                    >
                        <PlatformIcon
                            platform={question.answerSource.platform}
                            className="size-3"
                        />
                        <span className="max-w-[140px] truncate">
                            {question.answerSource.label ??
                                platformLabel(question.answerSource.platform)}
                        </span>
                        <ArrowUpRight
                            className="size-2.5 transition-transform group-hover/link:translate-x-px group-hover/link:-translate-y-px"
                            aria-hidden="true"
                        />
                    </a>
                ) : canManage ? (
                    <button
                        type="button"
                        onClick={onAnswer}
                        className={cn(
                            'inline-flex min-h-[28px] items-center gap-1 rounded-full',
                            'border border-dashed border-border/80 px-2 py-0.5 text-[11px] font-medium text-foreground/70',
                            'transition-[border-color,color,background-color] hover:border-[var(--accent-ink)]/50 hover:bg-[var(--accent-ink)]/8 hover:text-[var(--accent-ink)]',
                        )}
                    >
                        <Pencil className="size-3" />
                        {t('questions.card.mark_answered')}
                    </button>
                ) : null}
            </footer>

            {isComposing ? (
                <div className="border-t border-border/70 bg-foreground/[0.025] p-3">
                    {composer}
                </div>
            ) : null}
        </article>
    );
}
