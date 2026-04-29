import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ChevronDown,
    GripHorizontal,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { AnswerQuestionComposer } from '@/components/questions/answer-question-composer';
import { ListComposer } from '@/components/questions/list-composer';
import { QuestionBoardCard } from '@/components/questions/question-board-card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type {
    BoardList,
    BoardQuestion,
    ColumnKey,
} from '@/types/questions-board';

type Props = {
    list: BoardList | null; // null = unsorted
    questions: BoardQuestion[];
    columnKey: ColumnKey;
    canManage: boolean;
    canModerate: boolean;
    canDeleteList: boolean;
    moveTargets: Array<{ id: number | null; name: string }>;
    answeringId: number | null;
    onStartAnswer: (id: number) => void;
    onCancelAnswer: () => void;
    onAnswered: () => void;
    onUnanswer: (id: number) => void;
    onDelete: (id: number) => void;
    onMoveQuestion: (id: number, listId: number | null) => void;
    onRequestRename: () => void;
    onRequestDelete: () => void;
    isRenaming: boolean;
    onCancelRename: () => void;
    onRenamed: () => void;
};

export function QuestionListColumn({
    list,
    questions,
    columnKey,
    canManage,
    canModerate,
    canDeleteList,
    moveTargets,
    answeringId,
    onStartAnswer,
    onCancelAnswer,
    onAnswered,
    onUnanswer,
    onDelete,
    onMoveQuestion,
    onRequestRename,
    onRequestDelete,
    isRenaming,
    onCancelRename,
    onRenamed,
}: Props) {
    const { t } = useTranslate();
    const isUnsorted = list === null;
    const accent = list?.color ?? null;
    const title = list?.name ?? t('questions.list_column.unsorted');

    // List header drag handle (only for real lists, used to reorder columns).
    const {
        setNodeRef: setListSortableRef,
        transform: listTransform,
        transition: listTransition,
        isDragging: listIsDragging,
        listeners: listListeners,
        attributes: listAttributes,
    } = useSortable({
        id: `list:${list?.id ?? 'unsorted'}`,
        data: { kind: 'list', listId: list?.id ?? null },
        disabled: isUnsorted || !canManage,
    });

    // Droppable for question cards landing in this column.
    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `col:${columnKey}`,
        data: { kind: 'column', listId: list?.id ?? null },
    });

    const [open, setOpen] = useState(true);
    const sortableIds = questions.map((q) => `q:${q.id}`);

    return (
        <section
            ref={setListSortableRef}
            style={{
                transform: CSS.Translate.toString(listTransform),
                transition: listTransition,
            }}
            data-dragging={listIsDragging || undefined}
            className={cn(
                'group/col relative flex w-full shrink-0 flex-col rounded-2xl',
                'md:w-[340px]',
                'data-[dragging=true]:opacity-70',
            )}
        >
            <Collapsible open={open} onOpenChange={setOpen}>
                <ColumnHeader
                    title={title}
                    accent={accent}
                    count={questions.length}
                    canManage={canManage}
                    canDeleteList={canDeleteList && !isUnsorted}
                    isUnsorted={isUnsorted}
                    listeners={listListeners}
                    attributes={listAttributes}
                    onRename={onRequestRename}
                    onDelete={onRequestDelete}
                />

                {isRenaming && list ? (
                    <div className="px-1 pt-3">
                        <ListComposer
                            mode={{
                                kind: 'rename',
                                listId: list.id,
                                name: list.name,
                                color: list.color,
                            }}
                            onCancel={onCancelRename}
                            onSaved={onRenamed}
                        />
                    </div>
                ) : null}

                <CollapsibleContent
                    forceMount
                    className={cn(
                        'data-[state=closed]:hidden md:data-[state=closed]:block',
                    )}
                >
                    <div
                        ref={setDropRef}
                        data-over={isOver || undefined}
                        className={cn(
                            'mt-3 flex min-h-[120px] flex-col gap-2 rounded-xl border border-dashed border-transparent px-1 py-2',
                            'transition-colors',
                            'data-[over=true]:border-[var(--accent-ink)]/40 data-[over=true]:bg-[var(--accent-ink)]/[0.05]',
                        )}
                    >
                        <SortableContext
                            id={`col:${columnKey}`}
                            items={sortableIds}
                            strategy={verticalListSortingStrategy}
                        >
                            {questions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/30 px-3 py-8 text-center">
                                    <p className="font-mono text-[9px] tracking-[0.28em] text-muted-foreground uppercase">
                                        {t(
                                            'questions.list_column.drop_card_here',
                                        )}
                                    </p>
                                </div>
                            ) : (
                                questions.map((question) => (
                                    <QuestionBoardCard
                                        key={question.id}
                                        question={question}
                                        accent={accent}
                                        canManage={canManage}
                                        canModerate={canModerate}
                                        isComposing={
                                            answeringId === question.id
                                        }
                                        moveTargets={moveTargets.filter(
                                            (t) =>
                                                (t.id ?? 'unsorted') !==
                                                (list?.id ?? 'unsorted'),
                                        )}
                                        onAnswer={() =>
                                            onStartAnswer(question.id)
                                        }
                                        onUnanswer={() =>
                                            onUnanswer(question.id)
                                        }
                                        onDelete={() => onDelete(question.id)}
                                        onMoveTo={(listId) =>
                                            onMoveQuestion(question.id, listId)
                                        }
                                        composer={
                                            answeringId === question.id ? (
                                                <AnswerQuestionComposer
                                                    questionId={question.id}
                                                    initialUrl={
                                                        question.answerSource
                                                            ?.url ?? null
                                                    }
                                                    initialLabel={
                                                        question.answerSource
                                                            ?.label ?? null
                                                    }
                                                    onCancel={onCancelAnswer}
                                                    onSaved={onAnswered}
                                                />
                                            ) : null
                                        }
                                    />
                                ))
                            )}
                        </SortableContext>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Mobile-only "Add a question" hint when answering inline */}
            {isUnsorted && questions.length > 0 && canManage ? (
                <p className="mt-2 px-2 font-mono text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
                    {t('questions.list_column.drag_to_file')}
                </p>
            ) : null}
        </section>
    );
}

function ColumnHeader({
    title,
    accent,
    count,
    canManage,
    canDeleteList,
    isUnsorted,
    listeners,
    attributes,
    onRename,
    onDelete,
}: {
    title: string;
    accent: string | null;
    count: number;
    canManage: boolean;
    canDeleteList: boolean;
    isUnsorted: boolean;
    listeners?: ReturnType<typeof useSortable>['listeners'];
    attributes?: ReturnType<typeof useSortable>['attributes'];
    onRename: () => void;
    onDelete: () => void;
}) {
    const { t } = useTranslate();

    return (
        <div
            className={cn(
                'relative flex items-stretch overflow-visible rounded-t-2xl',
            )}
        >
            {/* Folder-tab styling: a colored bar on top edge */}
            <span
                aria-hidden="true"
                className="absolute inset-x-3 -top-1 h-1 rounded-t"
                style={{
                    backgroundColor: accent ?? 'transparent',
                }}
            />

            <div
                className={cn(
                    'relative flex flex-1 items-center gap-2 rounded-2xl border border-border/70 bg-card/95',
                    'px-3 py-2.5 sm:py-3',
                    'shadow-[0_1px_0_rgba(0,0,0,0.02)]',
                )}
            >
                {canManage && !isUnsorted ? (
                    <button
                        type="button"
                        aria-label={t('questions.list_column.drag_list')}
                        {...attributes}
                        {...listeners}
                        className={cn(
                            'flex size-6 shrink-0 cursor-grab touch-none items-center justify-center',
                            'rounded text-foreground/30 transition-colors hover:text-foreground/70 active:cursor-grabbing',
                        )}
                    >
                        <GripHorizontal
                            className="size-3.5"
                            aria-hidden="true"
                        />
                    </button>
                ) : null}

                <CollapsibleTrigger
                    className={cn(
                        'group/trigger flex min-w-0 flex-1 items-center gap-2 text-left',
                        'rounded transition-colors hover:bg-foreground/[0.03]',
                        'md:cursor-default md:hover:bg-transparent',
                    )}
                >
                    <span
                        aria-hidden="true"
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                            backgroundColor: accent ?? 'transparent',
                            boxShadow: accent
                                ? 'inset 0 0 0 1px rgba(0,0,0,0.15)'
                                : 'inset 0 0 0 1px var(--border)',
                        }}
                    />
                    <h2
                        className={cn(
                            'font-display min-w-0 flex-1 truncate text-base leading-tight font-semibold text-foreground',
                            isUnsorted ? 'text-foreground/65 italic' : '',
                        )}
                    >
                        {title}
                    </h2>
                    <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase tabular-nums">
                        {count.toString().padStart(2, '0')}
                    </span>
                    <ChevronDown
                        className="size-3.5 text-foreground/40 transition-transform group-data-[state=open]/trigger:rotate-180 md:hidden"
                        aria-hidden="true"
                    />
                </CollapsibleTrigger>

                {canManage && !isUnsorted ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={cn(
                                'flex size-7 shrink-0 items-center justify-center rounded-md text-foreground/40',
                                'transition-colors hover:bg-foreground/[0.04] hover:text-foreground/80',
                                'focus-visible:opacity-100 data-[state=open]:opacity-100',
                            )}
                            aria-label={t('questions.list_column.list_actions')}
                        >
                            <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="min-w-[180px]"
                        >
                            <DropdownMenuItem onSelect={onRename}>
                                <Pencil className="size-3.5" />
                                {t('questions.list_column.rename_color')}
                            </DropdownMenuItem>
                            {canDeleteList ? (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={onDelete}
                                    >
                                        <Trash2 className="size-3.5" />
                                        {t(
                                            'questions.list_column.dissolve_list',
                                        )}
                                    </DropdownMenuItem>
                                </>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
            </div>
        </div>
    );
}

/**
 * Trailing "create new list" affordance shown at the end of the columns row.
 * Stays visible at the end of the desk. Becomes a composer inline when activated.
 */
export function NewListSlot({
    composing,
    onStart,
    onCancel,
    onSaved,
}: {
    composing: boolean;
    onStart: () => void;
    onCancel: () => void;
    onSaved: () => void;
}) {
    const { t } = useTranslate();

    if (composing) {
        return (
            <div className="w-full shrink-0 md:w-[340px]">
                <ListComposer
                    mode={{ kind: 'create' }}
                    onCancel={onCancel}
                    onSaved={onSaved}
                />
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={onStart}
            className={cn(
                'group flex w-full shrink-0 items-center justify-center gap-2 self-start rounded-2xl',
                'border border-dashed border-border/80 bg-background/30 px-4 py-4',
                'min-h-[60px] font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase',
                'transition-[border-color,color,background-color] hover:border-foreground/50 hover:bg-card/60 hover:text-foreground',
                'md:w-[340px] md:py-6',
            )}
        >
            <Plus className="size-3.5" aria-hidden="true" />
            {t('questions.list_column.new_list')}
        </button>
    );
}
