import { Check } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export type TemplateOption = {
    key: 'minimal' | 'grid' | 'timeline';
    label: string;
    description: string;
};

type Props = {
    value: TemplateOption['key'];
    onChange: (next: TemplateOption['key']) => void;
    options: TemplateOption[];
};

/**
 * Three radio-cards stacked at mobile, side-by-side at `sm:`. Each card
 * shows a tiny stylized SVG thumbnail of the layout and a 1-line
 * description so the choice is decidable at a glance.
 */
export function TemplatePicker({ value, onChange, options }: Props) {
    const { t } = useTranslate();

    return (
        <fieldset>
            <legend className="sr-only">
                {t('customize.template_picker.fieldset_legend')}
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
                {options.map((option) => {
                    const selected = value === option.key;

                    return (
                        <button
                            type="button"
                            key={option.key}
                            data-test="template-option"
                            data-template={option.key}
                            aria-pressed={selected}
                            onClick={() => onChange(option.key)}
                            className={cn(
                                'group relative flex flex-col items-stretch gap-3 rounded-2xl border p-4 text-left transition-all',
                                'bg-card/60 backdrop-blur-sm',
                                selected
                                    ? 'border-foreground/70 shadow-[0_0_0_3px_oklch(from_var(--accent-ink)_l_c_h_/_0.18)]'
                                    : 'border-border/70 hover:border-foreground/40',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-xl',
                                    'border border-dashed border-border bg-background/60',
                                )}
                            >
                                <TemplateThumbnail variant={option.key} />
                            </div>

                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="font-display text-base font-semibold tracking-tight text-foreground">
                                        {option.label}
                                    </div>
                                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                                        {option.description}
                                    </p>
                                </div>
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                                        selected
                                            ? 'border-[var(--accent-ink)] bg-[var(--accent-ink)] text-[var(--accent-foreground)]'
                                            : 'border-border text-transparent',
                                    )}
                                >
                                    <Check className="size-3" />
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
 * Tiny SVG mockup per template. Pure shape work — caller frame draws the
 * surrounding rounded rectangle and dashed border. Uses `currentColor` so
 * it inherits the outer text color.
 */
function TemplateThumbnail({ variant }: { variant: TemplateOption['key'] }) {
    if (variant === 'grid') {
        return (
            <svg
                viewBox="0 0 150 100"
                className="h-full w-full"
                aria-hidden="true"
            >
                <rect
                    x="6"
                    y="6"
                    width="138"
                    height="14"
                    rx="2"
                    fill="currentColor"
                    opacity="0.08"
                />
                <rect x="6" y="9" width="40" height="2" fill="currentColor" />
                <g fill="currentColor" opacity="0.5">
                    <rect x="6" y="28" width="42" height="30" rx="2" />
                    <rect x="54" y="28" width="42" height="30" rx="2" />
                    <rect x="102" y="28" width="42" height="30" rx="2" />
                    <rect x="6" y="64" width="42" height="30" rx="2" />
                    <rect x="54" y="64" width="42" height="30" rx="2" />
                    <rect x="102" y="64" width="42" height="30" rx="2" />
                </g>
                <rect x="6" y="28" width="42" height="2" fill="currentColor" />
                <rect x="54" y="28" width="42" height="2" fill="currentColor" />
                <rect
                    x="102"
                    y="28"
                    width="42"
                    height="2"
                    fill="currentColor"
                />
            </svg>
        );
    }

    if (variant === 'timeline') {
        return (
            <svg
                viewBox="0 0 150 100"
                className="h-full w-full"
                aria-hidden="true"
            >
                <rect
                    x="6"
                    y="6"
                    width="138"
                    height="10"
                    fill="currentColor"
                    opacity="0.08"
                />
                <line
                    x1="20"
                    y1="26"
                    x2="20"
                    y2="94"
                    stroke="currentColor"
                    strokeWidth="0.6"
                    opacity="0.5"
                />
                <g fill="currentColor">
                    <circle cx="20" cy="34" r="2" />
                    <circle cx="20" cy="56" r="2" />
                    <circle cx="20" cy="78" r="2" />
                </g>
                <g fill="currentColor" opacity="0.55">
                    <rect x="30" y="32" width="60" height="2" rx="1" />
                    <rect x="30" y="37" width="100" height="2" rx="1" />
                    <rect x="30" y="42" width="80" height="2" rx="1" />

                    <rect x="30" y="54" width="50" height="2" rx="1" />
                    <rect x="30" y="59" width="100" height="2" rx="1" />
                    <rect x="30" y="64" width="70" height="2" rx="1" />

                    <rect x="30" y="76" width="40" height="2" rx="1" />
                    <rect x="30" y="81" width="92" height="2" rx="1" />
                    <rect x="30" y="86" width="64" height="2" rx="1" />
                </g>
            </svg>
        );
    }

    // Minimal: masthead + asymmetric hero/form + reading flow.
    return (
        <svg viewBox="0 0 150 100" className="h-full w-full" aria-hidden="true">
            <rect
                x="6"
                y="6"
                width="138"
                height="6"
                fill="currentColor"
                opacity="0.4"
            />
            {/* Big initial */}
            <text
                x="6"
                y="42"
                fontFamily="serif"
                fontSize="34"
                fontStyle="italic"
                fill="currentColor"
            >
                A.
            </text>
            {/* Form block */}
            <rect
                x="80"
                y="22"
                width="64"
                height="32"
                rx="3"
                fill="currentColor"
                opacity="0.18"
            />
            <rect x="84" y="28" width="30" height="2" fill="currentColor" />
            <rect
                x="84"
                y="34"
                width="56"
                height="14"
                rx="2"
                fill="currentColor"
                opacity="0.4"
            />
            {/* Reading flow */}
            <g fill="currentColor" opacity="0.45">
                <rect x="6" y="62" width="138" height="12" rx="2" />
                <rect x="6" y="78" width="138" height="12" rx="2" />
            </g>
        </svg>
    );
}
