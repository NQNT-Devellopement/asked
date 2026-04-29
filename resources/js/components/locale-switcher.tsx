import { router, usePage } from '@inertiajs/react';
import { Check, Languages } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { update as updateLocale } from '@/routes/locale';
import type { AvailableLocale, LocaleCode } from '@/types/global';

type Variant = 'inline' | 'pill' | 'icon';

type Props = {
    /** Visual variant. `pill` is the default in editorial chrome. */
    variant?: Variant;
    align?: 'start' | 'center' | 'end';
    className?: string;
};

/**
 * Editorial-styled language switcher. Posts to /locale with PATCH, preserves
 * scroll position, and lets Inertia refresh the page so translations,
 * `<html lang>` and persisted user preference all sync.
 */
export function LocaleSwitcher({
    variant = 'pill',
    align = 'end',
    className,
}: Props) {
    const { props } = usePage();
    const { t } = useTranslate();
    const current = (props.locale as LocaleCode | undefined) ?? 'en';
    const available =
        (props.availableLocales as AvailableLocale[] | undefined) ?? [];

    const [pending, setPending] = useState<LocaleCode | null>(null);

    const switchTo = (next: LocaleCode) => {
        if (next === current || pending !== null) {
            return;
        }

        setPending(next);

        router.patch(
            updateLocale().url,
            { locale: next },
            {
                preserveScroll: true,
                onFinish: () => setPending(null),
            },
        );
    };

    const currentLabel =
        available.find((entry) => entry.code === current)?.label ??
        current.toUpperCase();

    const triggerClasses = cn(
        'inline-flex items-center gap-2 transition-colors',
        variant === 'pill' &&
            'min-h-[36px] rounded-full border border-border/70 bg-card/40 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-foreground/75 uppercase hover:text-foreground',
        variant === 'inline' &&
            'font-mono text-[10px] tracking-[0.22em] text-foreground/75 uppercase hover:text-foreground',
        variant === 'icon' &&
            'size-9 rounded-full border border-border/70 bg-card/40 text-foreground/75 hover:text-foreground',
        className,
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={t('common.language.select')}
                className={triggerClasses}
            >
                <Languages
                    className={cn(
                        'size-3.5',
                        variant === 'icon' && 'mx-auto size-4',
                    )}
                    aria-hidden="true"
                />
                {variant !== 'icon' ? <span>{currentLabel}</span> : null}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align={align}
                className="min-w-44 font-mono text-[11px] tracking-[0.18em] uppercase"
            >
                {available.map((entry) => {
                    const selected = entry.code === current;
                    const isPending = pending === entry.code;

                    return (
                        <DropdownMenuItem
                            key={entry.code}
                            disabled={isPending}
                            onSelect={(event) => {
                                event.preventDefault();
                                switchTo(entry.code);
                            }}
                            className="cursor-pointer justify-between gap-3"
                        >
                            <span>{entry.label}</span>
                            {selected ? (
                                <Check
                                    className="size-3.5 text-[var(--accent-ink)]"
                                    aria-hidden="true"
                                />
                            ) : null}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
