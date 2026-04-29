/**
 * Client-side mirror of `App\Enums\AnswerSourcePlatform::detect()`.
 *
 * Keeps the answer composer in lockstep with the backend so the live
 * platform-icon preview matches what the server will persist.
 */
export type Platform =
    | 'youtube'
    | 'twitch'
    | 'twitter'
    | 'tiktok'
    | 'instagram'
    | 'spotify'
    | 'website';

function safeHost(url: string): string {
    const candidate = url.trim();

    if (candidate === '') {
        return '';
    }

    try {
        const withScheme = /^https?:\/\//i.test(candidate)
            ? candidate
            : `https://${candidate}`;

        return new URL(withScheme).host.toLowerCase();
    } catch {
        return '';
    }
}

export function detectPlatform(url: string): Platform {
    const host = safeHost(url);

    if (host === '') {
        return 'website';
    }

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
        return 'youtube';
    }

    if (host.includes('twitch.tv')) {
        return 'twitch';
    }

    if (host.includes('twitter.com') || host.includes('x.com')) {
        return 'twitter';
    }

    if (host.includes('tiktok.com')) {
        return 'tiktok';
    }

    if (host.includes('instagram.com')) {
        return 'instagram';
    }

    if (host.includes('spotify.com')) {
        return 'spotify';
    }

    return 'website';
}

/**
 * Returns true when the given string parses as an absolute http(s) URL.
 * Keeps the composer's submit gate cheap and predictable.
 */
export function isLikelyUrl(value: string): boolean {
    const trimmed = value.trim();

    if (trimmed === '') {
        return false;
    }

    try {
        const withScheme = /^https?:\/\//i.test(trimmed)
            ? trimmed
            : `https://${trimmed}`;
        const parsed = new URL(withScheme);

        return parsed.host.includes('.');
    } catch {
        return false;
    }
}
