import { ArrowDown } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';

type Props = {
    teamName: string;
};

export function FaqEmptyState({ teamName }: Props) {
    const { t } = useTranslate();

    return (
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/80 bg-card/40 px-6 py-12 text-center sm:py-16">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_1px_1px,_var(--border)_1px,_transparent_0)] [background-size:18px_18px] opacity-60"
            />

            <p className="font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                {t('faq.empty.eyebrow')}
            </p>
            <h3 className="font-display mx-auto mt-3 max-w-md text-2xl leading-snug text-balance text-foreground sm:text-3xl">
                {t('faq.empty.title', { name: teamName })}
            </h3>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                {t('faq.empty.description')}
            </p>

            <a
                href="#ask"
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
            >
                {t('faq.empty.cta')}
                <ArrowDown className="size-4" aria-hidden="true" />
            </a>
        </div>
    );
}
