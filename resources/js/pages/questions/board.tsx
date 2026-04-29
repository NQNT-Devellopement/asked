import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    closestCorners,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type {
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { ArrowUpRight, Inbox, Lock } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PlatformIcon, platformLabel } from '@/components/faq/platform-icon';
import {
    DeskGrain,
    DeskSlug,
    DeskStyleVariables,
} from '@/components/questions/desk-chrome';
import {
    NewListSlot,
    QuestionListColumn,
} from '@/components/questions/question-list-column';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { board, destroy, inbox, reorder, unanswer } from '@/routes/questions';
import {
    destroy as destroyList,
    reorder as reorderLists,
} from '@/routes/questions/lists';
import { UNSORTED_KEY, columnKey as keyForList } from '@/types/questions-board';
import type {
    BoardList,
    BoardPermissions,
    BoardQuestion,
    ColumnKey,
} from '@/types/questions-board';

type BoardProps = {
    team: { name: string; slug: string };
    lists: BoardList[];
    unsorted: BoardQuestion[];
    permissions: BoardPermissions;
};

type DragKind = 'question' | 'list';

type DragItem =
    | { kind: 'question'; question: BoardQuestion }
    | { kind: 'list'; list: BoardList };

const QUESTION_PREFIX = 'q:';
const LIST_PREFIX = 'list:';
const COLUMN_PREFIX = 'col:';

function parseDragId(id: string): { kind: DragKind; raw: string } | null {
    if (id.startsWith(QUESTION_PREFIX)) {
        return { kind: 'question', raw: id.slice(QUESTION_PREFIX.length) };
    }

    if (id.startsWith(LIST_PREFIX)) {
        return { kind: 'list', raw: id.slice(LIST_PREFIX.length) };
    }

    return null;
}

function parseColumnId(id: string): ColumnKey | null {
    if (!id.startsWith(COLUMN_PREFIX)) {
        return null;
    }

    const raw = id.slice(COLUMN_PREFIX.length);

    if (raw === 'unsorted') {
        return UNSORTED_KEY;
    }

    const numeric = Number(raw);

    return Number.isFinite(numeric) ? numeric : null;
}

export default function QuestionsBoard({
    team,
    lists: initialLists,
    unsorted: initialUnsorted,
    permissions,
}: BoardProps) {
    const { t } = useTranslate();
    const currentTeam = usePage().props.currentTeam;

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('questions.board.breadcrumb'),
                href: currentTeam ? board(currentTeam.slug).url : '#',
            },
        ],
    });

    const [lists, setLists] = useState<BoardList[]>(initialLists);
    const [unsorted, setUnsorted] = useState<BoardQuestion[]>(initialUnsorted);
    const [activeDrag, setActiveDrag] = useState<DragItem | null>(null);
    const [creatingList, setCreatingList] = useState(false);
    const [renamingListId, setRenamingListId] = useState<number | null>(null);
    const [answeringId, setAnsweringId] = useState<number | null>(null);

    // "Adjusting state when a prop changes" pattern from the React docs:
    // when Inertia delivers a fresh server snapshot (after answer / delete /
    // list mutations) we want our local board state to follow.
    const [prevInitialLists, setPrevInitialLists] = useState(initialLists);
    const [prevInitialUnsorted, setPrevInitialUnsorted] =
        useState(initialUnsorted);

    if (prevInitialLists !== initialLists) {
        setPrevInitialLists(initialLists);
        setLists(initialLists);
    }

    if (prevInitialUnsorted !== initialUnsorted) {
        setPrevInitialUnsorted(initialUnsorted);
        setUnsorted(initialUnsorted);
    }

    // Snapshots for rollback on optimistic failure.
    const snapshotRef = useRef<{
        lists: BoardList[];
        unsorted: BoardQuestion[];
    } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 6 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const moveTargets = useMemo(
        () => [
            { id: null, name: t('questions.list_column.unsorted') },
            ...lists.map((l) => ({ id: l.id as number | null, name: l.name })),
        ],
        [lists, t],
    );

    const totalQuestions =
        unsorted.length + lists.reduce((sum, l) => sum + l.questions.length, 0);
    const answeredQuestions =
        unsorted.filter((q) => q.status === 'answered').length +
        lists.reduce(
            (sum, l) =>
                sum + l.questions.filter((q) => q.status === 'answered').length,
            0,
        );

    const findQuestion = (id: number) => {
        for (const l of lists) {
            const q = l.questions.find((it) => it.id === id);

            if (q) {
                return { question: q, listId: l.id as number | null };
            }
        }

        const u = unsorted.find((it) => it.id === id);

        return u ? { question: u, listId: null } : null;
    };

    const replaceColumn = (
        listId: number | null,
        next: BoardQuestion[],
    ): void => {
        if (listId === null) {
            setUnsorted(next);

            return;
        }

        setLists((prev) =>
            prev.map((l) => (l.id === listId ? { ...l, questions: next } : l)),
        );
    };

    const getColumnQuestions = (
        columnKey: ColumnKey,
        snapshot?: { lists: BoardList[]; unsorted: BoardQuestion[] },
    ): BoardQuestion[] => {
        const ls = snapshot?.lists ?? lists;
        const us = snapshot?.unsorted ?? unsorted;

        if (columnKey === UNSORTED_KEY) {
            return us;
        }

        return ls.find((l) => l.id === columnKey)?.questions ?? [];
    };

    const takeSnapshot = () => {
        snapshotRef.current = {
            lists: lists.map((l) => ({
                ...l,
                questions: l.questions.map((q) => ({ ...q })),
            })),
            unsorted: unsorted.map((q) => ({ ...q })),
        };
    };

    const restoreSnapshot = () => {
        if (snapshotRef.current) {
            setLists(snapshotRef.current.lists);
            setUnsorted(snapshotRef.current.unsorted);
        }
    };

    /* ------------------------ Drag & Drop ------------------------ */

    const onDragStart = (event: DragStartEvent) => {
        const id = String(event.active.id);
        const parsed = parseDragId(id);

        if (!parsed) {
            return;
        }

        if (parsed.kind === 'question') {
            const found = findQuestion(Number(parsed.raw));

            if (found) {
                setActiveDrag({ kind: 'question', question: found.question });
                takeSnapshot();
            }

            return;
        }

        const list = lists.find((l) => String(l.id) === parsed.raw);

        if (list) {
            setActiveDrag({ kind: 'list', list });
            takeSnapshot();
        }
    };

    const resolveContainer = (id: string): ColumnKey | null => {
        const colKey = parseColumnId(id);

        if (colKey !== null) {
            return colKey;
        }

        const parsed = parseDragId(id);

        if (parsed?.kind === 'question') {
            const found = findQuestion(Number(parsed.raw));

            return found ? keyForList(found.listId) : null;
        }

        return null;
    };

    const onDragOver = (event: DragOverEvent) => {
        if (!activeDrag || activeDrag.kind !== 'question') {
            return;
        }

        const overId = event.over?.id ? String(event.over.id) : null;

        if (!overId) {
            return;
        }

        const targetCol = resolveContainer(overId);

        if (targetCol === null) {
            return;
        }

        const moving = activeDrag.question;
        const sourceCol = keyForList(moving.list?.id ?? null);

        if (sourceCol === targetCol) {
            return;
        }

        // Move card across columns optimistically (insertion at end on hover).
        const sourceList =
            sourceCol === UNSORTED_KEY ? null : (sourceCol as number);
        const targetList =
            targetCol === UNSORTED_KEY ? null : (targetCol as number);

        const sourceItems = getColumnQuestions(sourceCol).filter(
            (q) => q.id !== moving.id,
        );
        const targetItems = getColumnQuestions(targetCol);
        const updatedMoving: BoardQuestion = {
            ...moving,
            list:
                targetList === null
                    ? null
                    : lists.find((l) => l.id === targetList)
                      ? {
                            id: targetList,
                            name:
                                lists.find((l) => l.id === targetList)?.name ??
                                '',
                            color:
                                lists.find((l) => l.id === targetList)?.color ??
                                null,
                        }
                      : null,
        };

        replaceColumn(sourceList, sourceItems);
        replaceColumn(targetList, [...targetItems, updatedMoving]);
        setActiveDrag({ kind: 'question', question: updatedMoving });
    };

    const onDragEnd = (event: DragEndEvent) => {
        const drag = activeDrag;

        setActiveDrag(null);

        if (!drag) {
            return;
        }

        const overId = event.over?.id ? String(event.over.id) : null;

        if (!overId) {
            restoreSnapshot();

            return;
        }

        if (drag.kind === 'list') {
            handleListDrop(drag.list.id, overId);

            return;
        }

        handleQuestionDrop(drag.question.id, overId);
    };

    const handleListDrop = (listId: number, overId: string) => {
        const overParsed = parseDragId(overId);
        const targetId =
            overParsed?.kind === 'list' ? Number(overParsed.raw) : null;

        if (targetId === null || targetId === listId) {
            return;
        }

        const oldIndex = lists.findIndex((l) => l.id === listId);
        const newIndex = lists.findIndex((l) => l.id === targetId);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const reordered = arrayMove(lists, oldIndex, newIndex).map(
            (l, idx) => ({ ...l, position: idx }),
        );

        setLists(reordered);

        router.post(
            reorderLists(team.slug).url,
            { ids: reordered.map((l) => l.id) },
            {
                preserveScroll: true,
                preserveState: true,
                only: [],
                onError: () => {
                    toast.error(
                        t('questions.board.toast_reorder_lists_failed'),
                    );
                    restoreSnapshot();
                },
            },
        );
    };

    const handleQuestionDrop = (questionId: number, overId: string) => {
        const before = snapshotRef.current;
        const found = findQuestion(questionId);

        if (!found) {
            return;
        }

        const targetCol = resolveContainer(overId);

        if (targetCol === null) {
            restoreSnapshot();

            return;
        }

        const overParsed = parseDragId(overId);
        let targetItems = getColumnQuestions(targetCol);

        if (overParsed?.kind === 'question') {
            const overQuestionId = Number(overParsed.raw);
            const fromIdx = targetItems.findIndex((q) => q.id === questionId);
            const toIdx = targetItems.findIndex((q) => q.id === overQuestionId);

            if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
                targetItems = arrayMove(targetItems, fromIdx, toIdx);
            }
        }

        // Persist with positions normalised to indices.
        const targetListId =
            targetCol === UNSORTED_KEY ? null : (targetCol as number);

        const finalItems = targetItems.map((q, idx) => ({
            ...q,
            position: idx,
            list:
                targetListId === null
                    ? null
                    : {
                          id: targetListId,
                          name:
                              lists.find((l) => l.id === targetListId)?.name ??
                              '',
                          color:
                              lists.find((l) => l.id === targetListId)?.color ??
                              null,
                      },
        }));

        replaceColumn(targetListId, finalItems);

        // Determine the change-set to send to backend: items whose list_id or
        // position changed compared to the snapshot.
        const items: Array<{
            id: number;
            list_id: number | null;
            position: number;
        }> = [];

        const findInSnapshot = (id: number) => {
            if (!before) {
                return null;
            }

            for (const l of before.lists) {
                const q = l.questions.find((it) => it.id === id);

                if (q) {
                    return {
                        listId: l.id as number | null,
                        position: q.position,
                    };
                }
            }

            const u = before.unsorted.find((it) => it.id === id);

            return u ? { listId: null, position: u.position } : null;
        };

        for (const q of finalItems) {
            const prev = findInSnapshot(q.id);

            if (
                !prev ||
                prev.listId !== targetListId ||
                prev.position !== q.position
            ) {
                items.push({
                    id: q.id,
                    list_id: targetListId,
                    position: q.position,
                });
            }
        }

        // Source column may also have been re-indexed if we moved across lists.
        const sourceListId = before
            ? (findInSnapshot(questionId)?.listId ?? null)
            : null;

        if (sourceListId !== targetListId) {
            const sourceItems = getColumnQuestions(keyForList(sourceListId));

            sourceItems.forEach((q, idx) => {
                const prev = findInSnapshot(q.id);

                if (
                    !prev ||
                    prev.listId !== sourceListId ||
                    prev.position !== idx
                ) {
                    items.push({
                        id: q.id,
                        list_id: sourceListId,
                        position: idx,
                    });
                }
            });
        }

        if (items.length === 0) {
            return;
        }

        router.post(
            reorder(team.slug).url,
            { items },
            {
                preserveScroll: true,
                preserveState: true,
                only: [],
                onError: () => {
                    toast.error(t('questions.board.toast_reorder_failed'));
                    restoreSnapshot();
                },
            },
        );
    };

    /* ------------------------ Question actions ------------------------ */

    const onUnanswer = (id: number) => {
        router.delete(unanswer([team.slug, id]).url, {
            preserveScroll: true,
            preserveState: 'errors',
            onSuccess: () => {
                toast.success(t('questions.board.toast_unanswered'));
            },
            onError: () => {
                toast.error(t('questions.board.toast_action_failed'));
            },
        });
    };

    const onDelete = (id: number) => {
        if (!confirm(t('questions.board.confirm_delete_question'))) {
            return;
        }

        router.delete(destroy([team.slug, id]).url, {
            preserveScroll: true,
            preserveState: 'errors',
            onSuccess: () => {
                toast.success(t('questions.board.toast_question_deleted'));
            },
            onError: () => {
                toast.error(t('questions.board.toast_action_failed'));
            },
        });
    };

    const onMoveQuestion = (id: number, listId: number | null) => {
        const found = findQuestion(id);

        if (!found || found.listId === listId) {
            return;
        }

        takeSnapshot();

        // Optimistic move to end of target column.
        const fromCol = keyForList(found.listId);
        const toCol = keyForList(listId);
        const sourceItems = getColumnQuestions(fromCol).filter(
            (q) => q.id !== id,
        );
        const targetItems = getColumnQuestions(toCol);
        const updatedQuestion: BoardQuestion = {
            ...found.question,
            list:
                listId === null
                    ? null
                    : {
                          id: listId,
                          name: lists.find((l) => l.id === listId)?.name ?? '',
                          color:
                              lists.find((l) => l.id === listId)?.color ?? null,
                      },
        };

        replaceColumn(found.listId, sourceItems);
        replaceColumn(listId, [...targetItems, updatedQuestion]);

        const newSourceItems = sourceItems.map((q, idx) => ({
            id: q.id,
            list_id: found.listId,
            position: idx,
        }));
        const newTargetItems = [...targetItems, updatedQuestion].map(
            (q, idx) => ({
                id: q.id,
                list_id: listId,
                position: idx,
            }),
        );

        router.post(
            reorder(team.slug).url,
            { items: [...newSourceItems, ...newTargetItems] },
            {
                preserveScroll: true,
                preserveState: true,
                only: [],
                onError: () => {
                    toast.error(t('questions.board.toast_move_failed'));
                    restoreSnapshot();
                },
            },
        );
    };

    /* ------------------------ List actions ------------------------ */

    const onDeleteList = (listId: number) => {
        if (!confirm(t('questions.board.confirm_dissolve_list'))) {
            return;
        }

        router.delete(destroyList([team.slug, listId]).url, {
            preserveScroll: true,
            preserveState: 'errors',
            onSuccess: () => {
                toast.success(t('questions.board.toast_list_dissolved'));
            },
            onError: () => {
                toast.error(t('questions.board.toast_action_failed'));
            },
        });
    };

    /* ------------------------ Render ------------------------ */

    const sortableListIds = lists.map((l) => `list:${l.id}`);

    return (
        <>
            <Head title={t('questions.board.title', { team: team.name })}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div className="desk-root relative isolate min-h-[calc(100vh-4rem)] bg-[var(--page-bg)] text-foreground antialiased">
                <DeskStyleVariables />
                <DeskGrain />

                <div className="relative z-10 mx-auto w-full max-w-[1600px] px-5 pt-8 pb-24 sm:px-8 sm:pt-12 lg:px-10">
                    <Masthead
                        team={team}
                        total={totalQuestions}
                        answered={answeredQuestions}
                        listsCount={lists.length}
                    />

                    <div
                        aria-hidden="true"
                        className="desk-rule mt-8 h-px w-full"
                    />

                    {!permissions.canManageQuestions ? (
                        <LockedState />
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDragEnd={onDragEnd}
                            onDragCancel={() => {
                                restoreSnapshot();
                                setActiveDrag(null);
                            }}
                        >
                            <div className="mt-8 sm:mt-10 md:overflow-x-auto md:pb-4">
                                <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-5">
                                    <QuestionListColumn
                                        list={null}
                                        questions={unsorted}
                                        columnKey={UNSORTED_KEY}
                                        canManage={
                                            permissions.canManageQuestions
                                        }
                                        canModerate={
                                            permissions.canModerateQuestions
                                        }
                                        canDeleteList={false}
                                        moveTargets={moveTargets}
                                        answeringId={answeringId}
                                        onStartAnswer={(id) =>
                                            setAnsweringId(id)
                                        }
                                        onCancelAnswer={() =>
                                            setAnsweringId(null)
                                        }
                                        onAnswered={() => setAnsweringId(null)}
                                        onUnanswer={onUnanswer}
                                        onDelete={onDelete}
                                        onMoveQuestion={onMoveQuestion}
                                        onRequestRename={() => {}}
                                        onRequestDelete={() => {}}
                                        isRenaming={false}
                                        onCancelRename={() => {}}
                                        onRenamed={() => {}}
                                    />

                                    <SortableContext
                                        items={sortableListIds}
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        {lists.map((list) => (
                                            <QuestionListColumn
                                                key={list.id}
                                                list={list}
                                                questions={list.questions}
                                                columnKey={list.id}
                                                canManage={
                                                    permissions.canManageQuestions
                                                }
                                                canModerate={
                                                    permissions.canModerateQuestions
                                                }
                                                canDeleteList={
                                                    permissions.canDeleteList
                                                }
                                                moveTargets={moveTargets}
                                                answeringId={answeringId}
                                                onStartAnswer={(id) =>
                                                    setAnsweringId(id)
                                                }
                                                onCancelAnswer={() =>
                                                    setAnsweringId(null)
                                                }
                                                onAnswered={() =>
                                                    setAnsweringId(null)
                                                }
                                                onUnanswer={onUnanswer}
                                                onDelete={onDelete}
                                                onMoveQuestion={onMoveQuestion}
                                                onRequestRename={() =>
                                                    setRenamingListId(list.id)
                                                }
                                                onRequestDelete={() =>
                                                    onDeleteList(list.id)
                                                }
                                                isRenaming={
                                                    renamingListId === list.id
                                                }
                                                onCancelRename={() =>
                                                    setRenamingListId(null)
                                                }
                                                onRenamed={() =>
                                                    setRenamingListId(null)
                                                }
                                            />
                                        ))}
                                    </SortableContext>

                                    {permissions.canCreateList ? (
                                        <NewListSlot
                                            composing={creatingList}
                                            onStart={() =>
                                                setCreatingList(true)
                                            }
                                            onCancel={() =>
                                                setCreatingList(false)
                                            }
                                            onSaved={() =>
                                                setCreatingList(false)
                                            }
                                        />
                                    ) : null}
                                </div>
                            </div>

                            <DragOverlay dropAnimation={null}>
                                {activeDrag?.kind === 'question' ? (
                                    <DragGhost question={activeDrag.question} />
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    )}
                </div>
            </div>
        </>
    );
}

function Masthead({
    team,
    total,
    answered,
    listsCount,
}: {
    team: { name: string; slug: string };
    total: number;
    answered: number;
    listsCount: number;
}) {
    const { t } = useTranslate();

    return (
        <header className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <DeskSlug label={t('questions.board.slug_label')} accent />
                <Link
                    href={inbox(team.slug).url}
                    className={cn(
                        'group inline-flex min-h-[36px] items-center gap-1.5 rounded-full',
                        'border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-foreground/75 uppercase',
                        'transition-[border-color,background-color] hover:border-foreground/50 hover:bg-card',
                    )}
                >
                    <Inbox className="size-3" aria-hidden="true" />
                    {t('questions.board.to_inbox')}
                    <ArrowUpRight
                        className="size-3 transition-transform group-hover:translate-x-px group-hover:-translate-y-px"
                        aria-hidden="true"
                    />
                </Link>
            </div>

            <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
                <div>
                    <p className="font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                        {t('questions.board.edition_label', {
                            slug: team.slug,
                        })}
                    </p>
                    <h1
                        className={cn(
                            'font-display mt-2 text-4xl leading-[1.04] font-semibold tracking-tight text-balance text-foreground',
                            'sm:text-5xl lg:text-6xl',
                        )}
                    >
                        {t('questions.board.masthead_title')}
                        <span className="text-[var(--accent-ink)]">.</span>
                    </h1>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                        {t('questions.board.description')}
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
                    <DeskTally
                        label={t('questions.board.tally_on_desk')}
                        value={total}
                    />
                    <DeskTally
                        label={t('questions.board.tally_filed')}
                        value={listsCount}
                    />
                    <DeskTally
                        label={t('questions.board.tally_answered')}
                        value={answered}
                        accent
                    />
                </div>
            </div>
        </header>
    );
}

function DeskTally({
    label,
    value,
    accent = false,
}: {
    label: string;
    value: number;
    accent?: boolean;
}) {
    return (
        <div
            className={cn(
                'flex flex-col items-start rounded-xl border border-border/70 bg-card/70 px-3 py-2 sm:px-4 sm:py-2.5',
                accent
                    ? 'border-[var(--accent-ink)]/30 bg-[var(--accent-ink)]/[0.05]'
                    : '',
            )}
        >
            <span className="font-mono text-[9px] tracking-[0.28em] text-muted-foreground uppercase">
                {label}
            </span>
            <span
                className={cn(
                    'font-display text-2xl leading-none font-semibold tabular-nums sm:text-3xl',
                    accent ? 'text-[var(--accent-ink)]' : 'text-foreground',
                )}
            >
                {value.toString().padStart(2, '0')}
            </span>
        </div>
    );
}

function DragGhost({ question }: { question: BoardQuestion }) {
    const { t } = useTranslate();
    const author =
        question.authorName?.trim() ||
        t('questions.board.drag_overlay_anonymous');
    const isAnswered = question.status === 'answered';

    return (
        <div
            className={cn(
                'pointer-events-none w-[300px] rotate-[-2deg] rounded-xl border border-foreground/30 bg-card/95',
                'p-4 shadow-[0_24px_40px_-20px_rgba(15,12,8,0.55)]',
            )}
        >
            <div className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
                #{question.id}
                {isAnswered ? (
                    <span className="ml-2 text-[var(--accent-ink)]">
                        &middot; {t('questions.board.drag_overlay_answered')}
                    </span>
                ) : null}
            </div>
            <p className="font-display mt-2 text-sm leading-snug text-foreground">
                {question.body}
            </p>
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                <span>{author}</span>
                {isAnswered && question.answerSource ? (
                    <span className="inline-flex items-center gap-1">
                        <PlatformIcon
                            platform={question.answerSource.platform}
                            className="size-3"
                        />
                        {platformLabel(question.answerSource.platform)}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

function LockedState() {
    const { t } = useTranslate();

    return (
        <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed border-border/80 bg-card/40 px-6 py-16 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-foreground/5 text-foreground/60">
                <Lock className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-mono text-[10px] tracking-[0.32em] text-foreground/60 uppercase">
                {t('questions.board.locked_eyebrow')}
            </p>
            <h2 className="font-display mx-auto mt-3 max-w-md text-2xl leading-snug text-foreground sm:text-3xl">
                {t('questions.board.locked_title')}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                {t('questions.board.locked_description')}
            </p>
        </div>
    );
}
