import { Link } from '@inertiajs/react';
import { ArrowDown, ArrowUpRight, ChevronRight } from 'lucide-react';
import { PlatformIcon } from '@/components/faq/platform-icon';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { login, register } from '@/routes';

type Props = {
    canRegister: boolean;
};

export function HeroSection({ canRegister }: Props) {
    const { t } = useTranslate();
    const ctaHref = canRegister ? register().url : login().url;
    const year = new Date().getFullYear();

    return (
        <section className="relative px-5 pt-10 sm:px-8 sm:pt-16 lg:px-12 lg:pt-24">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-7">
                    <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.32em] text-foreground/60 uppercase">
                        <span
                            aria-hidden="true"
                            className="h-px w-8 bg-foreground/30"
                        />
                        {t('marketing.hero.issue_label')}
                        <span aria-hidden="true" className="text-border">
                            &middot;
                        </span>
                        <span>
                            {year} &middot; {t('marketing.hero.open_beta')}
                        </span>
                    </div>

                    <h1
                        className={cn(
                            'font-display mt-6 text-5xl leading-[0.96] font-semibold tracking-tight text-balance text-foreground',
                            'sm:text-7xl lg:text-[5.75rem]',
                        )}
                    >
                        {t('marketing.hero.title_part_one')}
                        <br />
                        <span className="text-foreground/55 italic">
                            {t('marketing.hero.title_part_two')}
                        </span>{' '}
                        <span className="text-foreground">
                            {t('marketing.hero.title_part_three')}
                        </span>
                        <span className="text-[var(--accent-ink)]">.</span>
                    </h1>

                    <p className="font-display mt-7 max-w-xl text-lg leading-relaxed text-foreground/80 sm:text-xl">
                        {t('marketing.hero.lede_intro')}
                        <span className="text-foreground">
                            {' '}
                            {t('marketing.hero.lede_emphasis')}
                        </span>{' '}
                        {t('marketing.hero.lede_outro')}
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        <Link
                            href={ctaHref}
                            className={cn(
                                'group inline-flex min-h-[52px] items-center gap-2 rounded-full',
                                'bg-foreground px-6 py-3 text-sm font-medium text-background',
                                'transition-transform hover:-translate-y-0.5',
                            )}
                        >
                            {canRegister
                                ? t('marketing.hero.cta_register')
                                : t('marketing.hero.cta_sign_in')}
                            <ArrowUpRight
                                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                aria-hidden="true"
                            />
                        </Link>
                        <a
                            href="#how-it-works"
                            className="group inline-flex min-h-[52px] items-center gap-2 rounded-full border border-foreground/20 px-5 py-3 text-sm text-foreground/80 transition-colors hover:border-foreground/45 hover:text-foreground"
                        >
                            {t('marketing.hero.see_how')}
                            <ArrowDown
                                className="size-4 transition-transform group-hover:translate-y-0.5"
                                aria-hidden="true"
                            />
                        </a>
                    </div>

                    <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-foreground/10 pt-6 font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase sm:gap-6">
                        <Stat
                            label={t('marketing.hero.stat_anonymous')}
                            value="Q"
                        />
                        <Stat
                            label={t('marketing.hero.stat_public')}
                            value="A"
                        />
                        <Stat
                            label={t('marketing.hero.stat_receipts')}
                            value="∞"
                            accent
                        />
                    </dl>
                </div>

                <div className="lg:col-span-5">
                    <IssueCover />
                </div>
            </div>
        </section>
    );
}

function Stat({
    label,
    value,
    accent = false,
}: {
    label: string;
    value: string;
    accent?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1">
            <span
                className={cn(
                    'font-display text-2xl leading-none font-semibold not-italic tabular-nums',
                    accent ? 'text-[var(--accent-ink)]' : 'text-foreground',
                )}
            >
                {value}
            </span>
            <span>{label}</span>
        </div>
    );
}

/**
 * The cover-image counterpart to a magazine masthead. A typeset sample
 * question mocked as if torn from the publication, with a YouTube receipt
 * stamped onto the bottom corner.
 */
function IssueCover() {
    const { t } = useTranslate();

    return (
        <div className="relative mx-auto w-full max-w-md">
            <div
                aria-hidden="true"
                className="absolute -inset-4 -rotate-1 rounded-[2rem] border border-dashed border-foreground/15"
            />
            <article className="relative overflow-hidden rounded-3xl border border-foreground/15 bg-background/65 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
                <header className="flex items-center justify-between border-b border-dashed border-foreground/15 pb-4 font-mono text-[9px] tracking-[0.32em] text-foreground/55 uppercase">
                    <span className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-[var(--accent-ink)]" />
                        {t('marketing.hero.cover.specimen')}
                    </span>
                    <span>{t('marketing.hero.cover.folio')}</span>
                </header>

                <p className="mt-5 font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                    {t('marketing.hero.cover.question_label')}
                </p>
                <p className="font-display mt-2 text-2xl leading-snug text-balance text-foreground sm:text-[1.65rem]">
                    {t('marketing.hero.cover.question_text_part_one')}{' '}
                    <span className="text-[var(--accent-ink)]">
                        {t('marketing.hero.cover.question_text_emphasis')}
                    </span>{' '}
                    {t('marketing.hero.cover.question_text_part_two')}
                </p>

                <div
                    aria-hidden="true"
                    className="my-6 h-px w-full bg-[image:linear-gradient(to_right,oklch(0.18_0.02_60/0.18)_0,oklch(0.18_0.02_60/0.18)_6px,transparent_6px,transparent_12px)] bg-[length:12px_1px] bg-repeat-x dark:bg-[image:linear-gradient(to_right,oklch(0.82_0.02_80/0.22)_0,oklch(0.82_0.02_80/0.22)_6px,transparent_6px,transparent_12px)]"
                />

                <p className="font-mono text-[10px] tracking-[0.32em] text-[var(--accent-ink)] uppercase">
                    {t('marketing.hero.cover.answered_label')}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                    {t('marketing.hero.cover.answer_text')}
                </p>

                <footer className="mt-6 flex items-center justify-between gap-3">
                    <ReceiptChip platform="youtube" label="YouTube" />
                    <span className="font-mono text-[9px] tracking-[0.28em] text-foreground/45 uppercase">
                        {t('marketing.hero.cover.filed_at')}
                    </span>
                </footer>

                <CornerStamp />
            </article>

            {/* Floating receipts to evoke a stack of resolved questions */}
            <FloatingReceipt
                position="top-left"
                platform="twitch"
                label={t('marketing.hero.cover.floating_live')}
            />
            <FloatingReceipt
                position="bottom-right"
                platform="twitter"
                label={t('marketing.hero.cover.floating_reply')}
            />
        </div>
    );
}

function ReceiptChip({
    platform,
    label,
}: {
    platform: 'youtube' | 'twitch' | 'twitter';
    label: string;
}) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background/60 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-foreground/80 uppercase">
            <PlatformIcon
                platform={platform}
                className="size-3.5 text-[var(--accent-ink)]"
            />
            {label}
            <ChevronRight
                className="size-3 text-foreground/40"
                aria-hidden="true"
            />
        </span>
    );
}

function CornerStamp() {
    const { t } = useTranslate();

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute top-4 right-4 hidden -rotate-6 font-mono text-[8px] tracking-[0.28em] text-[var(--stamp-ink)] uppercase sm:block"
        >
            <span className="block rounded-md border border-[color:var(--stamp-ink)]/40 bg-[var(--stamp-ink)]/5 px-2 py-1">
                {t('marketing.hero.cover.on_the_record')}
            </span>
        </div>
    );
}

function FloatingReceipt({
    position,
    platform,
    label,
}: {
    position: 'top-left' | 'bottom-right';
    platform: 'twitch' | 'twitter';
    label: string;
}) {
    const positional =
        position === 'top-left'
            ? '-top-3 -left-6 -rotate-6'
            : '-bottom-4 -right-4 rotate-3';

    return (
        <div
            aria-hidden="true"
            className={cn(
                'absolute z-10 hidden items-center gap-1.5 rounded-full border border-foreground/15 bg-background/85 px-3 py-1.5 font-mono text-[9px] tracking-[0.28em] text-foreground/75 uppercase shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:inline-flex',
                positional,
            )}
        >
            <PlatformIcon
                platform={platform}
                className="size-3 text-[var(--accent-ink)]"
            />
            {label}
        </div>
    );
}
