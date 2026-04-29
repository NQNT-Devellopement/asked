import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { login, register } from '@/routes';

type Props = {
    canRegister: boolean;
};

export function ClosingCta({ canRegister }: Props) {
    const { t } = useTranslate();
    const ctaHref = canRegister ? register().url : login().url;

    return (
        <section className="relative px-5 pb-24 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <div className="relative overflow-hidden rounded-[2rem] border border-foreground/15 bg-background/55 p-8 sm:p-12 lg:p-16">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,oklch(0.68_0.18_50/0.18),transparent_55%)]"
                    />
                    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                        <div className="lg:col-span-7">
                            <p className="font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                                {t('marketing.closing.eyebrow')}
                            </p>
                            <h2
                                className={cn(
                                    'font-display mt-4 text-4xl leading-[1.02] font-semibold tracking-tight text-balance text-foreground',
                                    'sm:text-6xl',
                                )}
                            >
                                {t('marketing.closing.title_part_one')}
                                <br />
                                <span className="text-foreground/55 italic">
                                    {t('marketing.closing.title_part_two')}
                                </span>
                                <span className="text-[var(--accent-ink)]">
                                    .
                                </span>
                            </h2>
                            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/75">
                                {t('marketing.closing.description')}
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:items-end lg:justify-end lg:text-right">
                            <Link
                                href={ctaHref}
                                className={cn(
                                    'group inline-flex min-h-[56px] items-center gap-2 rounded-full',
                                    'bg-foreground px-7 py-3.5 text-base font-medium text-background',
                                    'transition-transform hover:-translate-y-0.5',
                                )}
                            >
                                {canRegister
                                    ? t('marketing.closing.cta_register')
                                    : t('marketing.closing.cta_sign_in')}
                                <ArrowUpRight
                                    className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    aria-hidden="true"
                                />
                            </Link>
                            <p className="font-mono text-[10px] tracking-[0.28em] text-foreground/55 uppercase">
                                {t('marketing.closing.fineprint')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
