import type { FaqPlatform } from '@/components/faq/platform-icon';

export type OverlayPreset =
    | 'editorial'
    | 'banner-bottom'
    | 'card-corner'
    | 'quote';

export type StreamQuestionStatus =
    | 'approved'
    | 'answered'
    | 'addressed'
    | 'pending'
    | 'rejected';

export type StreamQuestion = {
    id: number;
    body: string;
    authorName: string | null;
    status: StreamQuestionStatus;
    answerSource: {
        url: string;
        label: string | null;
        platform: FaqPlatform | null;
    } | null;
    list: { id: number; name: string; color: string | null } | null;
    position: number;
    answeredAt: string | null;
    createdAt: string;
};

export type StreamSourceList = {
    id: number;
    name: string;
    color: string | null;
    position: number;
};

export type StreamSession = {
    id: number;
    name: string;
    secret_token: string;
    list_id: number | null;
    current_question_id: number | null;
    overlay_preset: OverlayPreset;
    is_active: boolean;
    last_polled_at: string | null;
    created_at: string;
    list: { id: number; name: string; color: string | null } | null;
    current_question: StreamQuestion | null;
    candidates_remaining: number;
    overlay_url: string;
};

export type StreamPermissions = {
    canManage: boolean;
};
