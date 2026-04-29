import { Inbox, Mic, Send } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { EditorialSlug } from '@/components/editorial-chrome';
import { PlatformIcon } from '@/components/faq/platform-icon';
import type { FaqPlatform } from '@/components/faq/platform-icon';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type StepKey = 'submission' | 'moderation' | 'receipt';

type Step = {
    key: StepKey;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    accent?: boolean;
    receipts?: { platform: FaqPlatform; label: string }[];
};

const STEPS: Step[] = [
    {
        key: 'submission',
        icon: Send,
    },
    {
        key: 'moderation',
        icon: Inbox,
    },
    {
        key: 'receipt',
        icon: Mic,
        accent: true,
        receipts: [
            { platform: 'youtube', label: 'YouTube' },
            { platform: 'twitch', label: 'Twitch' },
            { platform: 'twitter', label: 'X' },
        ],
    },
];

export function HowItWorks() {
    const { t } = useTranslate();

    return (
        <section
            id="how-it-works"
            className="relative px-5 pt-24 pb-12 sm:px-8 sm:pt-32 lg:px-12"
        >
            <div className="mx-auto max-w-6xl">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
                    <div>
                        <EditorialSlug
                            label={t('marketing.how_it_works.eyebrow')}
                            accent
                        />
                        <h2 className="font-display mt-3 max-w-2xl text-3xl leading-[1.05] font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                            {t('marketing.how_it_works.title_part_one')}
                            <span className="text-foreground/55 italic">
                                {' '}
                                {t('marketing.how_it_works.title_part_two')}
                            </span>
                            <br />
                            {t('marketing.how_it_works.title_part_three')}
                            <span className="text-[var(--accent-ink)]">.</span>
                        </h2>
                    </div>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        {t('marketing.how_it_works.description')}
                    </p>
                </header>

                <ol className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3">
                    {STEPS.map((step) => (
                        <StepCard key={step.key} step={step} />
                    ))}
                </ol>
            </div>
        </section>
    );
}

function StepCard({ step }: { step: Step }) {
    const { t } = useTranslate();
    const Icon = step.icon;

    return (
        <li
            className={cn(
                'group relative flex h-full flex-col gap-5 rounded-3xl border border-foreground/12 bg-background/55 p-6 backdrop-blur-sm',
                'transition-[transform,border-color] hover:-translate-y-1 hover:border-foreground/30',
                'sm:p-7',
            )}
        >
            <header className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase tabular-nums">
                    {t(`marketing.how_it_works.steps.${step.key}.index`)}
                </span>
                <span
                    className={cn(
                        'inline-flex size-9 items-center justify-center rounded-full border',
                        step.accent
                            ? 'border-[var(--accent-ink)]/35 bg-[var(--accent-ink)]/10 text-[var(--accent-ink)]'
                            : 'border-foreground/15 bg-foreground/[0.04] text-foreground/70',
                    )}
                    aria-hidden="true"
                >
                    <Icon className="size-4" />
                </span>
            </header>

            <div>
                <p
                    className={cn(
                        'font-mono text-[10px] tracking-[0.32em] uppercase',
                        step.accent
                            ? 'text-[var(--accent-ink)]'
                            : 'text-foreground/60',
                    )}
                >
                    {t(`marketing.how_it_works.steps.${step.key}.eyebrow`)}
                </p>
                <h3 className="font-display mt-2 text-xl leading-snug font-semibold text-balance text-foreground sm:text-2xl">
                    {t(`marketing.how_it_works.steps.${step.key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(`marketing.how_it_works.steps.${step.key}.body`)}
                </p>
            </div>

            {step.receipts ? (
                <footer className="mt-auto flex flex-wrap gap-2 border-t border-dashed border-foreground/15 pt-4">
                    {step.receipts.map((receipt) => (
                        <span
                            key={receipt.platform}
                            className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background/70 px-2.5 py-1 font-mono text-[9px] tracking-[0.28em] text-foreground/75 uppercase"
                        >
                            <PlatformIcon
                                platform={receipt.platform}
                                className="size-3 text-[var(--accent-ink)]"
                            />
                            {receipt.label}
                        </span>
                    ))}
                </footer>
            ) : null}
        </li>
    );
}
