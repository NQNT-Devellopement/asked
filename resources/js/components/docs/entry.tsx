import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EntryProps = {
    /** Anchor id, used for hash links and the table of contents. */
    id: string;
    /** Two-digit ordinal — "01", "02", … */
    index: string;
    eyebrow: string;
    title: string;
    /** Lede sits between the title and body — italic, larger, foreground/85. */
    lede: string;
    children: ReactNode;
};

/**
 * One numbered entry of the manual. Mirrors the editorial slug + display
 * heading + body rhythm used elsewhere in the marketing language. The Nº
 * lives in the gutter at lg, slips above the title at smaller widths.
 */
export function DocsEntry({
    id,
    index,
    eyebrow,
    title,
    lede,
    children,
}: EntryProps) {
    return (
        <article
            id={id}
            className="relative scroll-mt-32 border-t border-foreground/10 pt-12 sm:pt-16"
        >
            <header className="grid gap-3 lg:grid-cols-[7rem_1fr] lg:gap-10">
                <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-4 lg:pt-2">
                    <span
                        aria-hidden="true"
                        className={cn(
                            'font-display text-3xl leading-none font-semibold tabular-nums',
                            'text-[var(--accent-ink)]',
                        )}
                    >
                        {index}
                    </span>
                    <span
                        aria-hidden="true"
                        className="hidden h-px w-12 bg-foreground/15 lg:block"
                    />
                </div>
                <div>
                    <p className="font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                        {eyebrow}
                    </p>
                    <h2 className="font-display mt-3 text-3xl leading-[1.05] font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-[2.75rem]">
                        {title}
                        <span
                            aria-hidden="true"
                            className="text-[var(--accent-ink)]"
                        >
                            .
                        </span>
                    </h2>
                </div>
            </header>

            <div className="mt-7 lg:grid lg:grid-cols-[7rem_1fr] lg:gap-10">
                <div aria-hidden="true" className="hidden lg:block" />
                <div className="max-w-2xl space-y-5">
                    <p className="font-display text-xl leading-snug text-foreground/85 italic sm:text-2xl">
                        {lede}
                    </p>
                    {children}
                </div>
            </div>
        </article>
    );
}

type ParagraphProps = {
    children: ReactNode;
    className?: string;
};

/**
 * Body paragraph styled to match the editorial body rhythm — slightly
 * larger than UI text, generous leading, soft foreground.
 */
export function DocsParagraph({ children, className }: ParagraphProps) {
    return (
        <p
            className={cn(
                'text-[15px] leading-[1.7] text-foreground/80 sm:text-base',
                className,
            )}
        >
            {children}
        </p>
    );
}

type PullProps = {
    children: ReactNode;
};

/**
 * Pull-quote treatment used at the close of each entry. Italic display
 * face, em-dash, hairline rule above.
 */
export function DocsPull({ children }: PullProps) {
    return (
        <p className="font-display mt-2 flex items-baseline gap-3 border-l-2 border-[var(--accent-ink)]/40 pl-4 text-base leading-snug text-foreground/70 italic sm:text-lg">
            <span aria-hidden="true" className="text-[var(--accent-ink)]">
                &mdash;
            </span>
            <span>{children}</span>
        </p>
    );
}
