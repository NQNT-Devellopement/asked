import type { CSSProperties } from 'react';

/**
 * The four backgrounds available for a public Asked. page. Each is a paper
 * stock with its own mood: warm cream, deep ink, bone white, or noir black.
 *
 * `cream` is the default editorial cream. `ink` is the inverse — deep navy
 * black with cream type. `paper` is a cleaner, cooler bone for sharper
 * visuals. `noir` is the deepest end of the spectrum — near-black with the
 * dimmest grain, for moody / nocturnal pages.
 */
export type FaqBackground = 'cream' | 'ink' | 'paper' | 'noir';

export type FaqTheme = {
    accent: string;
    background: FaqBackground;
};

type BackgroundTokens = {
    /** Page background color (oklch). */
    pageBg: string;
    /** Primary type color (oklch). */
    ink: string;
    /** Muted/secondary type color (oklch). */
    muted: string;
    /** Editorial rule / hairline color (oklch with alpha). */
    rule: string;
    /** Card surface color (oklch with alpha). */
    surface: string;
    /** Border color for cards (oklch with alpha). */
    border: string;
    /** Grain overlay opacity. */
    grainOpacity: number;
    /** Whether the page reads as dark — used to bias mix-blend mode + grain. */
    isDark: boolean;
};

export const BACKGROUND_TOKENS: Record<FaqBackground, BackgroundTokens> = {
    cream: {
        pageBg: 'oklch(0.975 0.012 80)',
        ink: 'oklch(0.18 0.02 60)',
        muted: 'oklch(0.18 0.02 60 / 0.62)',
        rule: 'oklch(0.18 0.02 60 / 0.18)',
        surface: 'oklch(1 0 0 / 0.65)',
        border: 'oklch(0.18 0.02 60 / 0.14)',
        grainOpacity: 0.06,
        isDark: false,
    },
    ink: {
        pageBg: 'oklch(0.18 0.02 60)',
        ink: 'oklch(0.97 0.012 80)',
        muted: 'oklch(0.97 0.012 80 / 0.62)',
        rule: 'oklch(0.97 0.012 80 / 0.16)',
        surface: 'oklch(0.97 0.012 80 / 0.04)',
        border: 'oklch(0.97 0.012 80 / 0.12)',
        grainOpacity: 0.05,
        isDark: true,
    },
    paper: {
        pageBg: 'oklch(0.985 0.005 90)',
        ink: 'oklch(0.22 0.015 60)',
        muted: 'oklch(0.22 0.015 60 / 0.6)',
        rule: 'oklch(0.22 0.015 60 / 0.16)',
        surface: 'oklch(1 0 0 / 0.7)',
        border: 'oklch(0.22 0.015 60 / 0.12)',
        grainOpacity: 0.07,
        isDark: false,
    },
    noir: {
        pageBg: 'oklch(0.1 0.01 60)',
        ink: 'oklch(0.94 0.008 80)',
        muted: 'oklch(0.94 0.008 80 / 0.58)',
        rule: 'oklch(0.94 0.008 80 / 0.14)',
        surface: 'oklch(0.94 0.008 80 / 0.035)',
        border: 'oklch(0.94 0.008 80 / 0.1)',
        grainOpacity: 0.04,
        isDark: true,
    },
};

export const BACKGROUND_LABELS: Record<FaqBackground, string> = {
    cream: 'Cream',
    ink: 'Ink',
    paper: 'Paper',
    noir: 'Noir',
};

export const BACKGROUND_DESCRIPTIONS: Record<FaqBackground, string> = {
    cream: 'Warm newsprint. The default editorial cover.',
    ink: 'Deep navy paper. Inverted, late-edition mood.',
    paper: 'Bone-white stock. Crisp, gallery-clean.',
    noir: 'Near-black. After-hours, intimate.',
};

/**
 * Default fallback theme used when the backend hasn't seeded a value yet.
 * Matches the saffron-on-cream editorial direction the rest of the app ships.
 */
export const DEFAULT_THEME: FaqTheme = {
    accent: '#c97a2b',
    background: 'cream',
};

/**
 * Curated palette of accent colors that work across all four backgrounds.
 * The custom hex picker can override any of these.
 */
export const ACCENT_PRESETS: { value: string; label: string }[] = [
    { value: '#c97a2b', label: 'Saffron' },
    { value: '#a23226', label: 'Vermillion' },
    { value: '#1f5f4d', label: 'Forest' },
    { value: '#2563a8', label: 'Cobalt' },
    { value: '#7a2c8a', label: 'Aubergine' },
    { value: '#d4a437', label: 'Honey' },
    { value: '#1a1a1a', label: 'Ink' },
    { value: '#e0726f', label: 'Coral' },
];

/**
 * Approximate sRGB luminance. Uses the standard rec. 709 coefficients on
 * gamma-corrected channels. Good enough to decide whether to print white or
 * dark text against an arbitrary user-chosen accent — no color library needed.
 */
function luminance(hex: string): number {
    const cleaned = hex.replace('#', '').trim();
    const value =
        cleaned.length === 3
            ? cleaned
                  .split('')
                  .map((char) => char + char)
                  .join('')
            : cleaned;

    if (value.length !== 6 || !/^[0-9a-f]{6}$/i.test(value)) {
        return 0.5;
    }

    const r = parseInt(value.slice(0, 2), 16) / 255;
    const g = parseInt(value.slice(2, 4), 16) / 255;
    const b = parseInt(value.slice(4, 6), 16) / 255;

    const linearize = (channel: number): number => {
        return channel <= 0.04045
            ? channel / 12.92
            : Math.pow((channel + 0.055) / 1.055, 2.4);
    };

    return (
        0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
    );
}

/**
 * Returns true when a hex color string looks valid (3 or 6 hex digits, with
 * or without a leading `#`).
 */
export function isValidHex(value: string): boolean {
    const cleaned = value.replace('#', '').trim();

    return /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleaned);
}

/**
 * Normalize any hex string (with or without `#`, 3 or 6 digits) to
 * `#rrggbb` lower-case. Returns the original string when it can't be parsed.
 */
export function normalizeHex(value: string): string {
    const cleaned = value.replace('#', '').trim().toLowerCase();

    if (cleaned.length === 3 && /^[0-9a-f]{3}$/.test(cleaned)) {
        const expanded = cleaned
            .split('')
            .map((char) => char + char)
            .join('');

        return `#${expanded}`;
    }

    if (cleaned.length === 6 && /^[0-9a-f]{6}$/.test(cleaned)) {
        return `#${cleaned}`;
    }

    return value;
}

/**
 * Builds the inline `style` object that scopes the FAQ palette to a single
 * subtree. Drops `--accent-ink`, `--accent-foreground`, `--page-bg` plus the
 * typography colors so every template can inherit them with `var(--…)`.
 */
export function themeStyleVariables(theme: FaqTheme): CSSProperties {
    const tokens = BACKGROUND_TOKENS[theme.background];
    const accentLuminance = luminance(theme.accent);
    // Bright accents pair with dark text; mid/dark accents pair with cream
    // text. The 0.6 cutoff lands close to where saffron / honey / coral cross
    // into the "needs dark text" zone.
    const accentForeground =
        accentLuminance > 0.6 ? 'oklch(0.16 0.02 60)' : 'oklch(0.97 0.012 80)';

    return {
        '--accent-ink': theme.accent,
        '--accent-foreground': accentForeground,
        '--page-bg': tokens.pageBg,
        '--page-ink': tokens.ink,
        '--page-muted': tokens.muted,
        '--page-rule': tokens.rule,
        '--page-surface': tokens.surface,
        '--page-border': tokens.border,
        '--page-grain-opacity': tokens.grainOpacity.toString(),
        // Used by templates to tweak grain blend mode without re-checking the
        // background string.
        '--page-grain-blend': tokens.isDark ? 'overlay' : 'multiply',
        color: tokens.ink,
        backgroundColor: tokens.pageBg,
    } as CSSProperties;
}

/**
 * Whether the chosen background should be treated as a dark surface — handy
 * for switching mix-blend modes on overlays without re-importing tokens.
 */
export function isDarkBackground(background: FaqBackground): boolean {
    return BACKGROUND_TOKENS[background].isDark;
}
