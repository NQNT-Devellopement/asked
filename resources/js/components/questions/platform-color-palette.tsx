import { Check } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Curated swatch set for question-list tabs. Pulled from the editorial
 * palette: saffron, ink-blue, claret, sage, mustard, rose, slate.
 * Each value is a deliberate, slightly-muted hex so columns read as
 * filed dossiers rather than plastic kanban chips.
 */
export const LIST_COLOR_PALETTE: ReadonlyArray<{
    nameKey: string;
    value: string;
}> = [
    { nameKey: 'questions.palette.saffron', value: '#c9881f' },
    { nameKey: 'questions.palette.ink', value: '#2c4f7c' },
    { nameKey: 'questions.palette.claret', value: '#8e2f3a' },
    { nameKey: 'questions.palette.sage', value: '#5d7553' },
    { nameKey: 'questions.palette.mustard', value: '#a89234' },
    { nameKey: 'questions.palette.rose', value: '#a85b6e' },
    { nameKey: 'questions.palette.slate', value: '#54585d' },
] as const;

type Props = {
    value: string | null;
    onChange: (value: string | null) => void;
    label?: string;
    className?: string;
};

export function PlatformColorPalette({
    value,
    onChange,
    label,
    className,
}: Props) {
    const { t } = useTranslate();
    const resolvedLabel = label ?? t('questions.palette.tab');

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <span className="font-mono text-[9px] tracking-[0.28em] text-muted-foreground uppercase">
                {resolvedLabel}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    aria-pressed={value === null}
                    className={cn(
                        'group relative flex size-7 items-center justify-center rounded-full',
                        'border border-dashed border-border/80 bg-background/40',
                        'transition-[transform,border-color] hover:-translate-y-0.5 hover:border-foreground/40',
                        value === null
                            ? 'border-foreground/70 ring-2 ring-foreground/10'
                            : '',
                    )}
                    title={t('questions.palette.no_accent')}
                >
                    <span className="font-mono text-[8px] text-muted-foreground">
                        &empty;
                    </span>
                </button>
                {LIST_COLOR_PALETTE.map((swatch) => {
                    const selected =
                        value?.toLowerCase() === swatch.value.toLowerCase();
                    const swatchName = t(swatch.nameKey);

                    return (
                        <button
                            key={swatch.value}
                            type="button"
                            onClick={() => onChange(swatch.value)}
                            aria-pressed={selected}
                            title={swatchName}
                            style={{ backgroundColor: swatch.value }}
                            className={cn(
                                'group relative flex size-7 items-center justify-center rounded-full',
                                'shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.2)]',
                                'transition-[transform,box-shadow] hover:-translate-y-0.5',
                                selected
                                    ? 'ring-2 ring-foreground/60 ring-offset-2 ring-offset-[var(--page-bg)]'
                                    : '',
                            )}
                        >
                            {selected ? (
                                <Check
                                    className="size-3.5 text-white drop-shadow-sm"
                                    strokeWidth={3}
                                />
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
