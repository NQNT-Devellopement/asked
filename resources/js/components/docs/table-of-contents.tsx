import { cn } from '@/lib/utils';

export type TocEntry = {
    id: string;
    index: string;
    eyebrow: string;
    title: string;
};

type Props = {
    entries: TocEntry[];
    title: string;
    subtitle?: string;
    /** Visual variant — `masthead` is the front-of-page index, `aside` is the sticky right column on lg. */
    variant: 'masthead' | 'aside';
    className?: string;
};

/**
 * Editorial table of contents. Two variants share one component so the
 * masthead index and the lg sticky aside read with the same typesetting.
 *
 * The aside variant is rendered inside a sticky parent; this component
 * itself stays layout-neutral.
 */
export function DocsTableOfContents({
    entries,
    title,
    subtitle,
    variant,
    className,
}: Props) {
    const isAside = variant === 'aside';

    return (
        <nav
            aria-label={title}
            className={cn(
                isAside
                    ? 'rounded-2xl border border-foreground/12 bg-background/45 p-6 backdrop-blur-sm'
                    : 'rounded-3xl border border-foreground/12 bg-background/55 p-6 backdrop-blur-sm sm:p-8',
                className,
            )}
        >
            <header
                className={cn(
                    'flex items-baseline justify-between gap-4',
                    isAside ? 'pb-4' : 'pb-5',
                )}
            >
                <p className="font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                    {title}
                </p>
                {subtitle ? (
                    <p className="font-mono text-[9px] tracking-[0.28em] text-foreground/50 uppercase">
                        {subtitle}
                    </p>
                ) : null}
            </header>

            <div
                aria-hidden="true"
                className="editorial-rule h-px w-full"
                style={{ backgroundSize: '12px 1px' }}
            />

            <ol className={cn('mt-3 grid gap-px', isAside ? '' : 'sm:mt-4')}>
                {entries.map((entry) => (
                    <li key={entry.id}>
                        <a
                            href={`#${entry.id}`}
                            className={cn(
                                'group flex items-baseline gap-3 rounded-md py-2 transition-colors',
                                'hover:text-foreground',
                                isAside
                                    ? 'text-foreground/70'
                                    : 'text-foreground/80',
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className="font-mono text-[10px] tracking-[0.28em] text-foreground/45 uppercase tabular-nums group-hover:text-[var(--accent-ink)]"
                            >
                                {entry.index}
                            </span>
                            <span
                                className={cn(
                                    'font-display flex-1 leading-tight',
                                    isAside
                                        ? 'text-sm'
                                        : 'text-base sm:text-lg',
                                )}
                            >
                                {entry.title}
                            </span>
                            <span
                                aria-hidden="true"
                                className="hidden font-mono text-[9px] tracking-[0.28em] text-foreground/40 uppercase sm:block"
                            >
                                {entry.eyebrow}
                            </span>
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
