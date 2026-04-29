import { ArrowDown } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';

type Props = {
    teamName: string;
};

export function FaqEmptyState({ teamName }: Props) {
    const { t } = useTranslate();

    return (
        <section className="relative px-2 py-10 text-center sm:py-14">
            <div
                aria-hidden="true"
                className="mx-auto h-px w-20 bg-[color:var(--page-ink)]/25"
            />

            <p className="mt-7 font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                {t('faq.empty.eyebrow')}
            </p>
            <h3 className="font-display mx-auto mt-3 max-w-md text-2xl leading-snug text-balance text-[color:var(--page-ink)] sm:text-3xl">
                {t('faq.empty.title', { name: teamName })}
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[color:var(--page-ink)]/70">
                {t('faq.empty.description')}
            </p>

            <a
                href="#ask"
                className="mt-7 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[color:var(--page-ink)] px-5 py-2.5 text-sm font-medium text-[color:var(--page-bg)] transition-transform hover:-translate-y-0.5"
            >
                {t('faq.empty.cta')}
                <ArrowDown className="size-4" aria-hidden="true" />
            </a>

            <div
                aria-hidden="true"
                className="mx-auto mt-9 h-px w-20 bg-[color:var(--page-ink)]/25"
            />
        </section>
    );
}
