import { useCallback, useMemo } from 'react';

const LEET_MAP: Record<string, string> = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '@': 'a',
    $: 's',
};

/**
 * Mirror of App\Support\ContentFilter::normalize() / tokenize() in TS.
 * The `bannedWords` array MUST come from the server (already normalized
 * via ContentFilter::bannedWordsForClient).
 */
export function useContentFilter(bannedWords: string[]) {
    const set = useMemo(() => new Set(bannedWords), [bannedWords]);

    return useCallback(
        (text: string): boolean => {
            const normalized = text
                .toLowerCase()
                .normalize('NFD')
                .replace(/\p{Diacritic}/gu, '')
                .replace(/[013457@$]/g, (c) => LEET_MAP[c] ?? c);

            const tokens = normalized.split(/[^a-z]+/).filter(Boolean);

            return tokens.some((t) => set.has(t));
        },
        [set],
    );
}
