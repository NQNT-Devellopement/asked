import type { Auth } from '@/types/auth';
import type { Team } from '@/types/teams';

export type QuestionStats = {
    pendingCount: number;
};

export type LocaleCode = 'en' | 'fr';

export type AvailableLocale = {
    code: LocaleCode;
    label: string;
};

export type Translations = Record<string, string>;

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            currentTeam: Team | null;
            teams: Team[];
            questionStats: QuestionStats | null;
            locale: LocaleCode;
            availableLocales: AvailableLocale[];
            translations: Translations;
            [key: string]: unknown;
        };
    }
}
