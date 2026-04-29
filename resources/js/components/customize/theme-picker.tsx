import { Check } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslate } from '@/lib/i18n';
import {
    ACCENT_PRESETS,
    BACKGROUND_TOKENS,
    isValidHex,
    normalizeHex,
} from '@/lib/theme';
import type { FaqBackground } from '@/lib/theme';
import { cn } from '@/lib/utils';

export type BackgroundOption = {
    key: FaqBackground;
    label: string;
    description?: string;
};

type Props = {
    accent: string;
    background: FaqBackground;
    backgrounds: BackgroundOption[];
    onAccentChange: (next: string) => void;
    onBackgroundChange: (next: FaqBackground) => void;
};

/**
 * Two pickers stacked: a curated accent palette (with hex fallback) and a
 * radio-card row of the four backgrounds. Shows live swatches so the
 * combination registers without leaving the form.
 */
export function ThemePicker({
    accent,
    background,
    backgrounds,
    onAccentChange,
    onBackgroundChange,
}: Props) {
    const { t } = useTranslate();
    const normalized = normalizeHex(accent);
    const matchedPreset = ACCENT_PRESETS.find(
        (preset) => preset.value.toLowerCase() === normalized.toLowerCase(),
    );

    const handleHexChange = (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value;
        // Always pass through what the user typed; validation is done on
        // submit. This lets them paste partial hex without us yanking it.
        onAccentChange(next.startsWith('#') ? next : `#${next}`);
    };

    return (
        <div className="space-y-8">
            <div>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                    <Label className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                        {t('customize.theme_picker.accent_label')}
                    </Label>
                    <span className="font-mono text-[10px] text-muted-foreground">
                        {matchedPreset
                            ? matchedPreset.label
                            : t('customize.theme_picker.accent_custom')}
                    </span>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                    {ACCENT_PRESETS.map((preset) => {
                        const selected =
                            preset.value.toLowerCase() ===
                            normalized.toLowerCase();

                        return (
                            <button
                                type="button"
                                key={preset.value}
                                data-test="accent-preset"
                                aria-label={preset.label}
                                aria-pressed={selected}
                                onClick={() => onAccentChange(preset.value)}
                                className={cn(
                                    'group relative flex aspect-square items-center justify-center rounded-full border transition-all',
                                    selected
                                        ? 'border-foreground/60 ring-2 ring-foreground/30 ring-offset-2 ring-offset-background'
                                        : 'border-border/60 hover:border-foreground/40',
                                )}
                                style={{ backgroundColor: preset.value }}
                            >
                                <Check
                                    aria-hidden="true"
                                    className={cn(
                                        'size-3.5 transition-opacity',
                                        selected ? 'opacity-100' : 'opacity-0',
                                    )}
                                    style={{
                                        color: needsLightCheck(preset.value)
                                            ? 'oklch(0.95 0 0)'
                                            : 'oklch(0.16 0 0)',
                                    }}
                                />
                            </button>
                        );
                    })}
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <span
                        aria-hidden="true"
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60"
                        style={{
                            backgroundColor: isValidHex(accent)
                                ? normalized
                                : 'transparent',
                        }}
                    />
                    <div className="flex-1">
                        <Label
                            htmlFor="accent-hex"
                            className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase"
                        >
                            {t('customize.theme_picker.accent_hex_label')}
                        </Label>
                        <Input
                            id="accent-hex"
                            data-test="accent-hex"
                            value={accent}
                            onChange={handleHexChange}
                            placeholder="#c97a2b"
                            inputMode="text"
                            spellCheck={false}
                            className={cn(
                                'mt-1 h-10 rounded-lg font-mono text-sm tracking-wider',
                                !isValidHex(accent) &&
                                    accent.length > 0 &&
                                    'border-destructive/60',
                            )}
                        />
                    </div>
                </div>
            </div>

            <div>
                <Label className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                    {t('customize.theme_picker.background_label')}
                </Label>

                <fieldset className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <legend className="sr-only">
                        {t('customize.theme_picker.background_legend')}
                    </legend>
                    {backgrounds.map((option) => {
                        const tokens = BACKGROUND_TOKENS[option.key];
                        const selected = background === option.key;

                        return (
                            <button
                                type="button"
                                key={option.key}
                                data-test="background-option"
                                data-background={option.key}
                                aria-pressed={selected}
                                onClick={() => onBackgroundChange(option.key)}
                                className={cn(
                                    'group flex flex-col items-stretch gap-2 rounded-xl border p-2.5 text-left transition-all',
                                    selected
                                        ? 'border-foreground/70 shadow-[0_0_0_3px_oklch(from_var(--accent-ink)_l_c_h_/_0.18)]'
                                        : 'border-border/70 hover:border-foreground/40',
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className="block aspect-[3/2] w-full rounded-md border border-border/40"
                                    style={{
                                        backgroundColor: tokens.pageBg,
                                        backgroundImage: `linear-gradient(120deg, ${tokens.pageBg} 0%, ${tokens.pageBg} 60%, color-mix(in oklch, ${accent} 18%, transparent) 100%)`,
                                    }}
                                />
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-display text-sm font-semibold text-foreground">
                                        {option.label}
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'inline-flex size-4 items-center justify-center rounded-full border transition-colors',
                                            selected
                                                ? 'border-[var(--accent-ink)] bg-[var(--accent-ink)] text-[var(--accent-foreground)]'
                                                : 'border-border text-transparent',
                                        )}
                                    >
                                        <Check className="size-2.5" />
                                    </span>
                                </div>
                                {option.description ? (
                                    <p className="text-[11px] leading-snug text-muted-foreground">
                                        {option.description}
                                    </p>
                                ) : null}
                            </button>
                        );
                    })}
                </fieldset>
            </div>
        </div>
    );
}

/**
 * True when the swatch is dark enough that a white check reads clearer than
 * a black one. Quick perceptual approximation; same threshold used by
 * `themeStyleVariables`.
 */
function needsLightCheck(hex: string): boolean {
    const cleaned = hex.replace('#', '').trim();
    const value =
        cleaned.length === 3
            ? cleaned
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : cleaned;

    if (value.length !== 6) {
        return true;
    }

    const r = parseInt(value.slice(0, 2), 16) / 255;
    const g = parseInt(value.slice(2, 4), 16) / 255;
    const b = parseInt(value.slice(4, 6), 16) / 255;

    return 0.299 * r + 0.587 * g + 0.114 * b < 0.6;
}
