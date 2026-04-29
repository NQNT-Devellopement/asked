import { EditorialSlug } from '@/components/editorial-chrome';
import { PlatformIcon } from '@/components/faq/platform-icon';
import type { FaqPlatform } from '@/components/faq/platform-icon';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type AudienceKey = 'streamers' | 'youtubers' | 'community_managers';

type Audience = {
    key: AudienceKey;
    platforms: FaqPlatform[];
};

const AUDIENCES: Audience[] = [
    {
        key: 'streamers',
        platforms: ['twitch', 'youtube'],
    },
    {
        key: 'youtubers',
        platforms: ['youtube', 'twitter'],
    },
    {
        key: 'community_managers',
        platforms: ['twitter', 'instagram', 'website'],
    },
];

export function ForWhom() {
    const { t } = useTranslate();

    return (
        <section className="relative px-5 pt-12 pb-24 sm:px-8 sm:pt-20 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
                    <div>
                        <EditorialSlug
                            label={t('marketing.for_whom.eyebrow')}
                        />
                        <h2 className="font-display mt-3 max-w-2xl text-3xl leading-[1.05] font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
                            {t('marketing.for_whom.title_part_one')}
                            <br />
                            <span className="text-foreground/55 italic">
                                {t('marketing.for_whom.title_part_two')}
                            </span>
                            <span className="text-[var(--accent-ink)]">.</span>
                        </h2>
                    </div>
                </header>

                <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-foreground/12 bg-foreground/12 md:mt-14 md:grid-cols-3">
                    {AUDIENCES.map((audience, idx) => (
                        <AudienceCard
                            key={audience.key}
                            audience={audience}
                            index={idx + 1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function AudienceCard({
    audience,
    index,
}: {
    audience: Audience;
    index: number;
}) {
    const { t } = useTranslate();
    const number = index.toString().padStart(2, '0');

    return (
        <article
            className={cn(
                'flex h-full flex-col gap-6 bg-background/80 p-6 backdrop-blur-sm sm:p-8',
                'transition-colors hover:bg-background',
            )}
        >
            <header className="flex items-start justify-between gap-3">
                <span className="font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase tabular-nums">
                    {t('marketing.for_whom.volume', { number })}
                </span>
                <div className="flex items-center gap-1.5">
                    {audience.platforms.map((platform) => (
                        <span
                            key={platform}
                            className="inline-flex size-7 items-center justify-center rounded-full border border-foreground/15 bg-background text-foreground/65"
                            aria-hidden="true"
                        >
                            <PlatformIcon
                                platform={platform}
                                className="size-3"
                            />
                        </span>
                    ))}
                </div>
            </header>

            <div>
                <p className="font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                    {t(`marketing.for_whom.audiences.${audience.key}.eyebrow`)}
                </p>
                <h3 className="font-display mt-3 text-2xl leading-snug font-semibold text-balance text-foreground">
                    {t(`marketing.for_whom.audiences.${audience.key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(`marketing.for_whom.audiences.${audience.key}.body`)}
                </p>
            </div>

            <p className="font-display mt-auto text-base text-foreground/70 italic">
                &mdash; {t(`marketing.for_whom.audiences.${audience.key}.pull`)}
            </p>
        </article>
    );
}
