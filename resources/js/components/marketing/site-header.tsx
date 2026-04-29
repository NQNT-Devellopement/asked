import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { home, login, register } from '@/routes';
import { index as docsIndex } from '@/routes/docs';

type Props = {
    canRegister: boolean;
    isAuthed: boolean;
    dashboardUrl: string;
};

export function SiteHeader({ canRegister, isAuthed, dashboardUrl }: Props) {
    const { t } = useTranslate();

    return (
        <header className="relative z-20 px-5 pt-7 sm:px-8 sm:pt-9 lg:px-12">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
                <Link
                    href={home().url}
                    className="group font-display inline-flex items-baseline gap-2 text-xl tracking-tight text-foreground sm:text-2xl"
                >
                    <span className="font-display text-2xl leading-none font-semibold sm:text-3xl">
                        Asked
                    </span>
                    <span
                        aria-hidden="true"
                        className="text-[var(--accent-ink)]"
                    >
                        .
                    </span>
                    <span className="hidden font-mono text-[10px] tracking-[0.32em] text-foreground/50 uppercase sm:inline">
                        {t('marketing.nav.masthead_tagline')}
                    </span>
                </Link>

                <nav className="flex items-center gap-2 sm:gap-4">
                    <LocaleSwitcher
                        variant="inline"
                        className="hidden sm:inline-flex"
                    />
                    <Link
                        href={docsIndex().url}
                        className="hidden rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.28em] text-foreground/75 uppercase transition-colors hover:text-foreground sm:inline-flex"
                    >
                        {t('marketing.nav.docs')}
                    </Link>
                    {isAuthed ? (
                        <Link
                            href={dashboardUrl}
                            className={cn(
                                'group inline-flex items-center gap-1.5 rounded-full',
                                'border border-foreground/15 bg-background/40 px-4 py-1.5',
                                'font-mono text-[10px] tracking-[0.28em] text-foreground uppercase',
                                'transition-colors hover:border-foreground/35',
                            )}
                        >
                            {t('marketing.nav.to_the_desk')}
                            <ArrowUpRight
                                aria-hidden="true"
                                className="size-3 transition-transform group-hover:translate-x-px group-hover:-translate-y-px"
                            />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login().url}
                                className="rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.28em] text-foreground/75 uppercase transition-colors hover:text-foreground"
                            >
                                {t('marketing.nav.sign_in')}
                            </Link>
                            {canRegister ? (
                                <Link
                                    href={register().url}
                                    className={cn(
                                        'group inline-flex items-center gap-1.5 rounded-full',
                                        'bg-foreground px-4 py-1.5 font-mono text-[10px] tracking-[0.28em] text-background uppercase',
                                        'transition-transform hover:-translate-y-0.5',
                                    )}
                                >
                                    {t('marketing.nav.get_a_page')}
                                    <ArrowUpRight
                                        aria-hidden="true"
                                        className="size-3 transition-transform group-hover:translate-x-px group-hover:-translate-y-px"
                                    />
                                </Link>
                            ) : null}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
