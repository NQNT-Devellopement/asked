import type { FaqPlatform } from '@/components/faq/platform-icon';

export type BoardQuestionStatus =
    | 'approved'
    | 'answered'
    | 'pending'
    | 'rejected';

export type BoardQuestion = {
    id: number;
    body: string;
    authorName: string | null;
    status: BoardQuestionStatus;
    answerSource: {
        url: string;
        label: string | null;
        platform: FaqPlatform;
    } | null;
    list: { id: number; name: string; color: string | null } | null;
    position: number;
    answeredAt: string | null;
    createdAt: string;
};

export type BoardList = {
    id: number;
    name: string;
    color: string | null;
    position: number;
    questions: BoardQuestion[];
};

export type BoardPermissions = {
    canManageQuestions: boolean;
    canModerateQuestions: boolean;
    canCreateList: boolean;
    canDeleteList: boolean;
};

export const UNSORTED_KEY = 'unsorted' as const;

export type ColumnKey = number | typeof UNSORTED_KEY;

export function columnKey(listId: number | null): ColumnKey {
    return listId === null ? UNSORTED_KEY : listId;
}
