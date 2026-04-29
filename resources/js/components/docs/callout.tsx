import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CalloutProps = {
    label: string;
    children: ReactNode;
    className?: string;
};

/**
 * Editorial callout — a small framed block with a tracked-out label slug.
 * Used for inline lists like template names, paper stocks, roles.
 */
export function DocsCallout({ label, children, className }: CalloutProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-foreground/12 bg-background/55 p-5 backdrop-blur-sm sm:p-6',
                className,
            )}
        >
            <p className="font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                {label}
            </p>
            <div className="mt-3">{children}</div>
        </div>
    );
}

type Item = {
    name: string;
    body: string;
};

type DefinitionListProps = {
    items: Item[];
};

/**
 * Definition-list-shaped grid for short, named items (templates, roles…).
 * Each entry is a tiny card with a display name and one-line body.
 */
export function DocsDefinitionList({ items }: DefinitionListProps) {
    return (
        <dl className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {items.map((item) => (
                <div
                    key={item.name}
                    className="flex flex-col gap-2 rounded-xl border border-dashed border-foreground/15 bg-background/30 p-4"
                >
                    <dt className="font-display text-base font-semibold text-foreground">
                        {item.name}
                    </dt>
                    <dd className="text-[13px] leading-relaxed text-foreground/70">
                        {item.body}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

type SimpleListProps = {
    items: string[];
};

/**
 * Plain bullet list with editorial dot-style markers and tight spacing.
 */
export function DocsSimpleList({ items }: SimpleListProps) {
    return (
        <ul className="space-y-2">
            {items.map((item) => (
                <li
                    key={item}
                    className="flex gap-3 text-[14px] leading-[1.7] text-foreground/80 sm:text-[15px]"
                >
                    <span
                        aria-hidden="true"
                        className="mt-[0.65em] inline-block h-1 w-1.5 shrink-0 rounded-full bg-[var(--accent-ink)]"
                    />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}
