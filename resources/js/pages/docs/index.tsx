import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import {
    DocsCallout,
    DocsDefinitionList,
    DocsSimpleList,
} from '@/components/docs/callout';
import { DocsEntry, DocsParagraph, DocsPull } from '@/components/docs/entry';
import { DocsTableOfContents } from '@/components/docs/table-of-contents';
import type { TocEntry } from '@/components/docs/table-of-contents';
import {
    EditorialGrain,
    EditorialSlug,
    EditorialStyleVariables,
} from '@/components/editorial-chrome';
import { PlatformIcon } from '@/components/faq/platform-icon';
import type { FaqPlatform } from '@/components/faq/platform-icon';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard, home, login, register } from '@/routes';

type DocsIndexProps = {
    canRegister?: boolean;
};

type SectionKey =
    | 'what_is'
    | 'getting_started'
    | 'customize'
    | 'receiving'
    | 'lists'
    | 'answering'
    | 'teams'
    | 'languages'
    | 'privacy'
    | 'help';

const SECTION_KEYS: SectionKey[] = [
    'what_is',
    'getting_started',
    'customize',
    'receiving',
    'lists',
    'answering',
    'teams',
    'languages',
    'privacy',
    'help',
];

const TEMPLATE_KEYS = ['minimal', 'grid', 'timeline'] as const;
const PAPER_KEYS = ['cream', 'paper', 'ink', 'noir'] as const;
const ROLE_KEYS = ['owner', 'admin', 'member'] as const;
const PLATFORMS: FaqPlatform[] = [
    'youtube',
    'twitch',
    'twitter',
    'tiktok',
    'instagram',
    'spotify',
    'website',
];

/**
 * The Manual — a long-form, single-page guide to Asked. Reads like the help
 * section of a small magazine: a numbered set of editorial entries, with an
 * index at the top and a sticky aside on lg breakpoints.
 */
export default function DocsIndex({ canRegister = true }: DocsIndexProps) {
    const { t } = useTranslate();
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug).url : '/';
    const isAuthed = Boolean(auth?.user);
    const ctaHref = canRegister ? register().url : login().url;

    const tocEntries: TocEntry[] = SECTION_KEYS.map((key, idx) => ({
        id: slugFor(key),
        index: (idx + 1).toString().padStart(2, '0'),
        eyebrow: t(`docs.sections.${key}.eyebrow`),
        title: t(`docs.sections.${key}.title`),
    }));

    return (
        <>
            <Head title={t('docs.meta.title')}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
                <meta name="description" content={t('docs.meta.description')} />
            </Head>

            <div className="editorial-root relative min-h-screen overflow-x-hidden bg-[var(--page-bg)] text-foreground antialiased">
                <EditorialStyleVariables />
                <EditorialGrain withGlow />

                <div className="relative z-10">
                    <SiteHeader
                        canRegister={canRegister}
                        isAuthed={isAuthed}
                        dashboardUrl={dashboardUrl}
                    />

                    <main id="top">
                        <Masthead />

                        <section className="px-5 sm:px-8 lg:px-12">
                            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
                                <div className="min-w-0">
                                    <DocsTableOfContents
                                        entries={tocEntries}
                                        title={t('docs.toc.title')}
                                        subtitle={t(
                                            'docs.masthead.kicker_count',
                                        )}
                                        variant="masthead"
                                        className="lg:hidden"
                                    />

                                    <div className="space-y-16 sm:space-y-20">
                                        <Entries entries={tocEntries} />
                                    </div>

                                    <BackToTop label={t('docs.toc.top')} />
                                </div>

                                <aside className="hidden lg:block">
                                    <div className="sticky top-24">
                                        <DocsTableOfContents
                                            entries={tocEntries}
                                            title={t('docs.toc.title')}
                                            subtitle={t('docs.toc.subtitle')}
                                            variant="aside"
                                        />
                                        <p className="mt-4 px-1 font-mono text-[10px] tracking-[0.28em] text-foreground/45 uppercase">
                                            {t('docs.toc.jump_to')}
                                        </p>
                                    </div>
                                </aside>
                            </div>
                        </section>

                        <ClosingCta
                            ctaHref={ctaHref}
                            canRegister={canRegister}
                        />
                    </main>

                    <SiteFooter />
                </div>
            </div>
        </>
    );
}

function slugFor(key: SectionKey): string {
    return key.replace(/_/g, '-');
}

function Masthead() {
    const { t } = useTranslate();

    return (
        <section className="relative px-5 pt-10 pb-12 sm:px-8 sm:pt-16 sm:pb-16 lg:px-12 lg:pt-24 lg:pb-20">
            <div className="mx-auto max-w-6xl">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-12">
                    <div>
                        <EditorialSlug
                            label={t('docs.masthead.eyebrow')}
                            accent
                            count={t('docs.masthead.kicker_count')}
                        />

                        <h1
                            className={cn(
                                'font-display mt-6 text-5xl leading-[0.96] font-semibold tracking-tight text-balance text-foreground',
                                'sm:text-7xl lg:text-[5.5rem]',
                            )}
                        >
                            {t('docs.masthead.title_lead')}{' '}
                            <span className="text-foreground/55 italic">
                                {t('docs.masthead.title_emphasis')}
                            </span>
                            <br />
                            {t('docs.masthead.title_outro')}
                            <span className="text-[var(--accent-ink)]">.</span>
                        </h1>

                        <p className="font-display mt-7 max-w-xl text-lg leading-relaxed text-foreground/80 sm:text-xl">
                            {t('docs.masthead.lede')}
                        </p>

                        <p className="mt-6 font-mono text-[10px] tracking-[0.28em] text-foreground/55 uppercase">
                            {t('docs.masthead.volume')}
                        </p>
                    </div>

                    <div className="hidden self-end lg:block">
                        <ManualPlate />
                    </div>
                </div>
            </div>
        </section>
    );
}

/**
 * Decorative "press plate" — the Manual's masthead seal. Sits at the
 * upper-right of the title block on lg+, evokes the colophon stamp on the
 * back of an old issue.
 */
function ManualPlate() {
    const { t } = useTranslate();

    return (
        <div className="relative">
            <div
                aria-hidden="true"
                className="absolute -inset-3 -rotate-2 rounded-[2rem] border border-dashed border-foreground/15"
            />
            <div className="relative overflow-hidden rounded-3xl border border-foreground/15 bg-background/65 p-7 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
                <p className="font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                    {t('docs.toc.title')}
                </p>
                <p className="font-display mt-4 text-5xl leading-none font-semibold text-foreground">
                    Manual
                    <span
                        aria-hidden="true"
                        className="text-[var(--accent-ink)]"
                    >
                        .
                    </span>
                </p>
                <div
                    aria-hidden="true"
                    className="editorial-rule mt-6 h-px w-full"
                    style={{ backgroundSize: '12px 1px' }}
                />
                <dl className="mt-5 grid grid-cols-2 gap-3 font-mono text-[9px] tracking-[0.28em] text-foreground/55 uppercase">
                    <div>
                        <dt className="text-foreground/40">EN</dt>
                        <dd className="mt-1 text-foreground/80">English</dd>
                    </div>
                    <div>
                        <dt className="text-foreground/40">FR</dt>
                        <dd className="mt-1 text-foreground/80">Français</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}

function Entries({ entries }: { entries: TocEntry[] }) {
    const { t } = useTranslate();

    return (
        <>
            {SECTION_KEYS.map((key, idx) => {
                const entry = entries[idx];
                const base = `docs.sections.${key}`;

                return (
                    <DocsEntry
                        key={key}
                        id={entry.id}
                        index={entry.index}
                        eyebrow={entry.eyebrow}
                        title={entry.title}
                        lede={t(`${base}.lede`)}
                    >
                        <SectionBody sectionKey={key} />
                        <DocsPull>{t(`${base}.pull`)}</DocsPull>
                    </DocsEntry>
                );
            })}
        </>
    );
}

function SectionBody({ sectionKey }: { sectionKey: SectionKey }) {
    const { t } = useTranslate();
    const base = `docs.sections.${sectionKey}`;

    if (sectionKey === 'getting_started') {
        return (
            <>
                <DocsParagraph>
                    {t(`${base}.body_one`)}
                    <code className="rounded-md border border-foreground/12 bg-foreground/[0.04] px-1.5 py-0.5 font-mono text-[12px] text-foreground/85">
                        /{t(`${base}.body_one_code`)}
                    </code>
                    {t(`${base}.body_one_outro`)}
                </DocsParagraph>
                <DocsParagraph>{t(`${base}.body_two`)}</DocsParagraph>
            </>
        );
    }

    if (sectionKey === 'customize') {
        const templates = TEMPLATE_KEYS.map((key) => ({
            name: t(`${base}.templates.${key}.name`),
            body: t(`${base}.templates.${key}.body`),
        }));
        const papers = PAPER_KEYS.map((key) => t(`${base}.paper.${key}`));

        return (
            <>
                <DocsParagraph>{t(`${base}.body_one`)}</DocsParagraph>
                <DocsCallout label={t(`${base}.templates_label`)}>
                    <DocsDefinitionList items={templates} />
                </DocsCallout>
                <DocsParagraph>{t(`${base}.body_two`)}</DocsParagraph>
                <DocsCallout label={t(`${base}.paper_label`)}>
                    <DocsSimpleList items={papers} />
                </DocsCallout>
            </>
        );
    }

    if (sectionKey === 'answering') {
        return (
            <>
                <DocsParagraph>{t(`${base}.body_one`)}</DocsParagraph>
                <DocsCallout label={t(`${base}.platforms_label`)}>
                    <ul className="flex flex-wrap gap-2">
                        {PLATFORMS.map((platform) => (
                            <li
                                key={platform}
                                className="inline-flex items-center gap-2 rounded-full border border-foreground/12 bg-background/60 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-foreground/80 uppercase"
                            >
                                <PlatformIcon
                                    platform={platform}
                                    className="size-3.5 text-[var(--accent-ink)]"
                                />
                                {platformDisplayName(platform)}
                            </li>
                        ))}
                    </ul>
                </DocsCallout>
                <DocsParagraph>{t(`${base}.body_two`)}</DocsParagraph>
            </>
        );
    }

    if (sectionKey === 'teams') {
        const roles = ROLE_KEYS.map((key) => t(`${base}.roles.${key}`));

        return (
            <>
                <DocsParagraph>{t(`${base}.body_one`)}</DocsParagraph>
                <DocsParagraph>{t(`${base}.body_two`)}</DocsParagraph>
                <DocsCallout label={t(`${base}.roles_label`)}>
                    <DocsSimpleList items={roles} />
                </DocsCallout>
            </>
        );
    }

    return (
        <>
            <DocsParagraph>{t(`${base}.body_one`)}</DocsParagraph>
            <DocsParagraph>{t(`${base}.body_two`)}</DocsParagraph>
        </>
    );
}

function platformDisplayName(platform: FaqPlatform): string {
    const map: Record<FaqPlatform, string> = {
        youtube: 'YouTube',
        twitch: 'Twitch',
        twitter: 'X',
        tiktok: 'TikTok',
        instagram: 'Instagram',
        spotify: 'Spotify',
        website: 'Web',
    };

    return map[platform];
}

function BackToTop({ label }: { label: string }) {
    return (
        <div className="mt-16 flex items-center justify-end">
            <a
                href="#top"
                className="group inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/40 px-4 py-2 font-mono text-[10px] tracking-[0.28em] text-foreground/75 uppercase transition-colors hover:border-foreground/35 hover:text-foreground"
            >
                <ArrowUp
                    className="size-3 transition-transform group-hover:-translate-y-0.5"
                    aria-hidden="true"
                />
                {label}
            </a>
        </div>
    );
}

function ClosingCta({
    ctaHref,
    canRegister,
}: {
    ctaHref: string;
    canRegister: boolean;
}) {
    const { t } = useTranslate();

    return (
        <section className="relative px-5 pt-20 pb-24 sm:px-8 sm:pt-28 lg:px-12">
            <div className="mx-auto max-w-6xl">
                <div className="relative overflow-hidden rounded-[2rem] border border-foreground/15 bg-background/55 p-8 sm:p-12 lg:p-16">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_85%,oklch(0.68_0.18_50/0.18),transparent_55%)]"
                    />
                    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                        <div className="lg:col-span-7">
                            <p className="font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                                {t('docs.cta.eyebrow')}
                            </p>
                            <h2
                                className={cn(
                                    'font-display mt-4 text-4xl leading-[1.02] font-semibold tracking-tight text-balance text-foreground',
                                    'sm:text-5xl lg:text-6xl',
                                )}
                            >
                                {t('docs.cta.title_part_one')}
                                <br />
                                <span className="text-foreground/55 italic">
                                    {t('docs.cta.title_part_two')}
                                </span>
                                <span className="text-[var(--accent-ink)]">
                                    .
                                </span>
                            </h2>
                            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/75">
                                {t('docs.cta.description')}
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-3 lg:col-span-5 lg:items-end lg:justify-end">
                            <Link
                                href={ctaHref}
                                className={cn(
                                    'group inline-flex min-h-[56px] items-center gap-2 rounded-full',
                                    'bg-foreground px-7 py-3.5 text-base font-medium text-background',
                                    'transition-transform hover:-translate-y-0.5',
                                )}
                            >
                                {canRegister
                                    ? t('docs.cta.cta_register')
                                    : t('docs.cta.cta_sign_in')}
                                <ArrowUpRight
                                    className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    aria-hidden="true"
                                />
                            </Link>
                            <Link
                                href={home().url}
                                className="font-mono text-[10px] tracking-[0.28em] text-foreground/55 uppercase transition-colors hover:text-foreground"
                            >
                                {t('docs.cta.cta_back_home')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
