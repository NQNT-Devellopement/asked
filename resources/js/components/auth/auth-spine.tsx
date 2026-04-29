import { Quote } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * The editorial "spine" that sits in the right column of the auth layout on
 * desktop. Acts like the printed spine of the publication: a serif slogan,
 * an oversized pull-quote, and a couple of metadata rules.
 *
 * This is intentionally non-functional decor — a piece of typography, not a
 * marketing illustration.
 */
export function AuthSpine() {
    const { t } = useTranslate();
    const year = new Date().getFullYear();

    return (
        <aside
            className={cn(
                'relative hidden h-full overflow-hidden md:flex md:flex-col',
                'bg-[var(--page-bg)] px-10 py-12 lg:px-14 lg:py-16',
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,oklch(0.68_0.18_50/0.18),transparent_55%)]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-32 right-[-15%] -z-10 size-[460px] rounded-full bg-[var(--accent-ink)]/[0.18] blur-[120px]"
            />

            <header className="flex items-center justify-between font-mono text-[10px] tracking-[0.32em] text-foreground/60 uppercase">
                <span className="flex items-center gap-2">
                    <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-[var(--accent-ink)]"
                    />
                    {t('auth.shell.spine.eyebrow')}
                </span>
                <span>{t('auth.shell.spine.volume', { year })}</span>
            </header>

            <div className="flex flex-1 items-center">
                <div className="max-w-xl">
                    <p className="font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                        {t('auth.shell.spine.editor_note')}
                    </p>

                    <figure className="relative mt-6">
                        <Quote
                            aria-hidden="true"
                            className="absolute -top-4 -left-3 size-8 rotate-180 text-[var(--accent-ink)]/40"
                        />
                        <blockquote
                            className={cn(
                                'font-display text-balance text-foreground',
                                'text-[2.5rem] leading-[1.05] font-medium tracking-tight',
                                'lg:text-[3.25rem]',
                            )}
                        >
                            <span className="text-foreground/65 italic">
                                {t('auth.shell.spine.quote_part_one')}
                            </span>{' '}
                            {t('auth.shell.spine.quote_part_two')}
                            <span className="text-[var(--accent-ink)]">
                                .
                            </span>{' '}
                            {t('auth.shell.spine.quote_part_three')}
                        </blockquote>
                        <figcaption className="mt-7 flex items-center gap-3 font-mono text-[10px] tracking-[0.28em] text-foreground/55 uppercase">
                            <span
                                aria-hidden="true"
                                className="h-px w-8 bg-foreground/30"
                            />
                            {t('auth.shell.spine.caption')}
                        </figcaption>
                    </figure>
                </div>
            </div>

            <footer className="mt-auto flex items-end justify-between gap-6">
                <div
                    aria-hidden="true"
                    className="h-px flex-1 bg-[image:linear-gradient(to_right,oklch(0.18_0.02_60/0.18)_0,oklch(0.18_0.02_60/0.18)_6px,transparent_6px,transparent_12px)] bg-[length:12px_1px] bg-repeat-x dark:bg-[image:linear-gradient(to_right,oklch(0.82_0.02_80/0.22)_0,oklch(0.82_0.02_80/0.22)_6px,transparent_6px,transparent_12px)]"
                />
                <span className="font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                    {t('auth.shell.spine.folio')}
                </span>
            </footer>
        </aside>
    );
}
