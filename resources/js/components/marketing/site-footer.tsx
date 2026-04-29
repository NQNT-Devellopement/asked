import { useTranslate } from '@/lib/i18n';

export function SiteFooter() {
    const { t } = useTranslate();
    const year = new Date().getFullYear();

    return (
        <footer className="relative z-10 px-5 pb-10 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <div
                    aria-hidden="true"
                    className="h-px w-full bg-[image:linear-gradient(to_right,oklch(0.18_0.02_60/0.18)_0,oklch(0.18_0.02_60/0.18)_6px,transparent_6px,transparent_12px)] bg-[length:12px_1px] bg-repeat-x dark:bg-[image:linear-gradient(to_right,oklch(0.82_0.02_80/0.22)_0,oklch(0.82_0.02_80/0.22)_6px,transparent_6px,transparent_12px)]"
                />
                <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-[0.28em] text-foreground/70 uppercase">
                    <span>{t('credits.partnership.lead')}</span>
                    {/* TODO: replace href once NQNT-SOURCE URL is provided. */}
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono tracking-[0.22em] text-foreground transition-colors hover:text-[var(--accent-ink)]"
                    >
                        {t('credits.partnership.partner_name')}
                    </a>
                    <span
                        aria-hidden="true"
                        className="text-[var(--accent-ink)]"
                    >
                        —
                    </span>
                    <span className="text-muted-foreground">
                        {t('credits.partnership.partner_descriptor')}
                    </span>
                </p>
                <div className="mt-3 flex flex-col items-start justify-between gap-3 font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-foreground/70">Asked.</span>
                        <span aria-hidden="true" className="text-border">
                            /
                        </span>
                        <span>{t('marketing.footer.masthead')}</span>
                        <span aria-hidden="true" className="text-border">
                            /
                        </span>
                        <span className="tabular-nums">© {year}</span>
                    </div>
                    <ul className="flex items-center gap-5">
                        <li>
                            <a
                                href="#"
                                className="transition-colors hover:text-foreground"
                            >
                                {t('marketing.footer.press')}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="transition-colors hover:text-foreground"
                            >
                                {t('marketing.footer.privacy')}
                            </a>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="transition-colors hover:text-foreground"
                            >
                                {t('marketing.footer.terms')}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
