import { Check } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { OverlayPreset } from '@/types/stream';

const PRESET_KEYS: OverlayPreset[] = [
    'editorial',
    'banner-bottom',
    'card-corner',
    'quote',
];

type Props = {
    value: OverlayPreset;
    onChange: (next: OverlayPreset) => void;
    disabled?: boolean;
    /** Visual density. `compact` is used in the side settings panel. */
    density?: 'default' | 'compact';
    /** Optional element id used by the corresponding form label. */
    fieldsetId?: string;
};

/**
 * Four radio-cards each showing a tiny stylised SVG thumbnail of the
 * corresponding overlay preset. Mirrors the public-page template picker
 * shape so the editorial language stays consistent across the app.
 */
export function PresetPicker({
    value,
    onChange,
    disabled = false,
    density = 'default',
    fieldsetId,
}: Props) {
    const { t } = useTranslate();

    return (
        <fieldset id={fieldsetId} disabled={disabled}>
            <legend className="sr-only">
                {t('stream.fields.preset_label')}
            </legend>
            <div
                className={cn(
                    'grid gap-2.5 sm:grid-cols-2',
                    density === 'default' ? 'lg:grid-cols-4 lg:gap-3' : '',
                )}
            >
                {PRESET_KEYS.map((preset) => {
                    const selected = value === preset;
                    const label = t(`stream.presets.${preset}.label`);
                    const description = t(
                        `stream.presets.${preset}.description`,
                    );

                    return (
                        <button
                            type="button"
                            key={preset}
                            data-test="preset-option"
                            data-preset={preset}
                            aria-pressed={selected}
                            onClick={() => onChange(preset)}
                            disabled={disabled}
                            className={cn(
                                'group relative flex flex-col items-stretch gap-2.5 rounded-xl border p-3 text-left transition-all',
                                'bg-card/60 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-[var(--accent-ink)]/40 focus-visible:outline-none',
                                'disabled:cursor-not-allowed disabled:opacity-60',
                                selected
                                    ? 'border-foreground/70 shadow-[0_0_0_3px_oklch(from_var(--accent-ink)_l_c_h_/_0.18)]'
                                    : 'border-border/70 hover:border-foreground/40',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-lg',
                                    'border border-dashed border-border bg-background/60',
                                )}
                            >
                                <PresetThumbnail variant={preset} />
                            </div>

                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="font-display text-sm font-semibold tracking-tight text-foreground">
                                        {label}
                                    </div>
                                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'inline-flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                                        selected
                                            ? 'border-[var(--accent-ink)] bg-[var(--accent-ink)] text-[var(--accent-foreground)]'
                                            : 'border-border text-transparent',
                                    )}
                                >
                                    <Check className="size-2.5" />
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}

/**
 * Tiny SVG mockup per preset. Frame is drawn by the caller; this draws only
 * the inner shapes. Uses `currentColor` so it follows the surrounding text
 * colour like the public-page template thumbnails.
 */
function PresetThumbnail({ variant }: { variant: OverlayPreset }) {
    const common = {
        viewBox: '0 0 150 100',
        className: 'h-full w-full',
        'aria-hidden': true,
    } as const;

    if (variant === 'editorial') {
        return (
            <svg {...common}>
                {/* video frame */}
                <rect
                    x="6"
                    y="6"
                    width="138"
                    height="88"
                    rx="3"
                    fill="currentColor"
                    opacity="0.06"
                />
                {/* subtle eyebrow */}
                <rect
                    x="14"
                    y="34"
                    width="22"
                    height="2"
                    fill="currentColor"
                    opacity="0.55"
                />
                {/* big serif lines */}
                <text
                    x="14"
                    y="58"
                    fontFamily="serif"
                    fontSize="14"
                    fontStyle="italic"
                    fill="currentColor"
                >
                    Why
                </text>
                <text
                    x="40"
                    y="58"
                    fontFamily="serif"
                    fontSize="14"
                    fill="currentColor"
                >
                    do
                </text>
                <rect
                    x="14"
                    y="64"
                    width="118"
                    height="3"
                    rx="1"
                    fill="currentColor"
                    opacity="0.85"
                />
                <rect
                    x="14"
                    y="71"
                    width="92"
                    height="3"
                    rx="1"
                    fill="currentColor"
                    opacity="0.55"
                />
                {/* saffron mark */}
                <circle cx="36" cy="36" r="1.6" fill="currentColor" />
            </svg>
        );
    }

    if (variant === 'banner-bottom') {
        return (
            <svg {...common}>
                <rect
                    x="6"
                    y="6"
                    width="138"
                    height="88"
                    rx="3"
                    fill="currentColor"
                    opacity="0.06"
                />
                {/* avatar / play hint mid-frame */}
                <circle
                    cx="75"
                    cy="44"
                    r="12"
                    fill="currentColor"
                    opacity="0.18"
                />
                <polygon
                    points="71,38 71,50 82,44"
                    fill="currentColor"
                    opacity="0.45"
                />
                {/* banner */}
                <rect
                    x="6"
                    y="76"
                    width="138"
                    height="18"
                    fill="currentColor"
                    opacity="0.85"
                />
                <rect
                    x="14"
                    y="82"
                    width="44"
                    height="2"
                    fill="currentColor"
                    opacity="0"
                />
                <rect
                    x="14"
                    y="82"
                    width="60"
                    height="2"
                    fill="oklch(0.985 0 0)"
                />
                <rect
                    x="14"
                    y="87"
                    width="100"
                    height="2"
                    fill="oklch(0.985 0 0)"
                    opacity="0.7"
                />
            </svg>
        );
    }

    if (variant === 'card-corner') {
        return (
            <svg {...common}>
                <rect
                    x="6"
                    y="6"
                    width="138"
                    height="88"
                    rx="3"
                    fill="currentColor"
                    opacity="0.06"
                />
                <circle
                    cx="75"
                    cy="50"
                    r="14"
                    fill="currentColor"
                    opacity="0.18"
                />
                {/* card */}
                <rect
                    x="84"
                    y="58"
                    width="52"
                    height="30"
                    rx="3"
                    fill="currentColor"
                    opacity="0.92"
                />
                <rect
                    x="89"
                    y="64"
                    width="20"
                    height="2"
                    rx="1"
                    fill="oklch(0.985 0 0)"
                    opacity="0.75"
                />
                <rect
                    x="89"
                    y="70"
                    width="42"
                    height="2"
                    rx="1"
                    fill="oklch(0.985 0 0)"
                />
                <rect
                    x="89"
                    y="75"
                    width="36"
                    height="2"
                    rx="1"
                    fill="oklch(0.985 0 0)"
                    opacity="0.7"
                />
                <rect
                    x="89"
                    y="80"
                    width="28"
                    height="2"
                    rx="1"
                    fill="oklch(0.985 0 0)"
                    opacity="0.55"
                />
            </svg>
        );
    }

    // Quote — oversized full-bleed pull-quote.
    return (
        <svg {...common}>
            <rect
                x="6"
                y="6"
                width="138"
                height="88"
                rx="3"
                fill="currentColor"
                opacity="0.06"
            />
            <text
                x="14"
                y="54"
                fontFamily="serif"
                fontSize="42"
                fontStyle="italic"
                fill="currentColor"
                opacity="0.85"
            >
                &ldquo;
            </text>
            <rect
                x="34"
                y="36"
                width="100"
                height="3"
                rx="1"
                fill="currentColor"
                opacity="0.85"
            />
            <rect
                x="34"
                y="44"
                width="84"
                height="3"
                rx="1"
                fill="currentColor"
                opacity="0.7"
            />
            <rect
                x="34"
                y="52"
                width="68"
                height="3"
                rx="1"
                fill="currentColor"
                opacity="0.55"
            />
            <rect
                x="34"
                y="72"
                width="22"
                height="2"
                rx="1"
                fill="currentColor"
                opacity="0.65"
            />
        </svg>
    );
}
