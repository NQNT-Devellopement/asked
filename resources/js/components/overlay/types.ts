/**
 * Canonical question shape rendered by the overlay presets, mirroring the
 * payload produced by {@link \App\Support\QuestionPresenter}. We re-declare it
 * locally (rather than importing FaqQuestion) because the overlay only ever
 * displays approved questions and stays insulated from the public FAQ surface.
 */
export type OverlayQuestion = {
    id: number;
    body: string;
    authorName: string | null;
    status: 'pending' | 'approved' | 'answered' | 'rejected';
    answerSource: {
        url: string;
        label: string | null;
        platform: string | null;
    } | null;
    list: {
        id: number;
        name: string;
        color: string | null;
    } | null;
    position: number;
    answeredAt: string | null;
    createdAt: string;
};

/**
 * Lightweight team shape passed to every preset. Keeps the overlay decoupled
 * from the wider auth-only team profile.
 */
export type OverlayTeam = {
    name: string;
    slug: string;
};

/**
 * Animation lifecycle phase used by every preset. The page-level orchestrator
 * drives this via `data-phase` so each preset can author its own choreography
 * with pure CSS transitions / keyframes.
 */
export type OverlayPhase = 'entering' | 'entered' | 'exiting';

/**
 * Common props every preset receives.
 */
export type PresetProps = {
    question: OverlayQuestion;
    team: OverlayTeam;
    phase: OverlayPhase;
};
