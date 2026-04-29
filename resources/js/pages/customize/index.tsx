import { Head, Link, setLayoutProps, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    Check,
    Eye,
    Loader2,
    Maximize2,
    Minus,
    Monitor,
    Plus,
    Smartphone,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { TemplatePicker } from '@/components/customize/template-picker';
import type { TemplateOption } from '@/components/customize/template-picker';
import { ThemePicker } from '@/components/customize/theme-picker';
import type { BackgroundOption } from '@/components/customize/theme-picker';
import { GridTemplate } from '@/components/faq/templates/grid-template';
import { MinimalTemplate } from '@/components/faq/templates/minimal-template';
import { TimelineTemplate } from '@/components/faq/templates/timeline-template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PREVIEW_QUESTIONS } from '@/lib/faq-fixtures';
import { useTranslate } from '@/lib/i18n';
import {
    DEFAULT_THEME,
    isValidHex,
    normalizeHex,
    themeStyleVariables,
} from '@/lib/theme';
import type { FaqBackground, FaqTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import {
    edit as customizeEditRoute,
    previewSlug as previewSlugRoute,
    update as updateCustomize,
} from '@/routes/customize';

type FaqTemplateKey = 'minimal' | 'grid' | 'timeline';

type CustomizeProps = {
    team: {
        name: string;
        headline: string | null;
        tagline: string | null;
        slug: string;
        template: FaqTemplateKey;
        theme: FaqTheme;
    };
    publicUrl: string;
    templates: TemplateOption[];
    backgrounds: BackgroundOption[];
};

type CustomizeFormShape = {
    name: string;
    headline: string;
    tagline: string;
    template: FaqTemplateKey;
    theme: FaqTheme;
};

type DeviceFrame = 'desktop' | 'mobile';

export default function CustomizeIndex({
    team,
    publicUrl,
    templates,
    backgrounds,
}: CustomizeProps) {
    const { t } = useTranslate();
    const currentTeam = usePage().props.currentTeam;

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('app.nav.customize'),
                href: currentTeam
                    ? customizeEditRoute(currentTeam.slug).url
                    : '#',
            },
        ],
    });

    const [device, setDevice] = useState<DeviceFrame>('desktop');

    const initialTheme: FaqTheme = {
        accent: team.theme?.accent ?? DEFAULT_THEME.accent,
        background: team.theme?.background ?? DEFAULT_THEME.background,
    };

    const form = useForm<CustomizeFormShape>({
        name: team.name,
        headline: team.headline ?? '',
        tagline: team.tagline ?? '',
        template: team.template ?? 'minimal',
        theme: initialTheme,
    });

    const setTemplate = (next: FaqTemplateKey) => {
        form.setData('template', next);
    };

    const setAccent = (next: string) => {
        form.setData('theme', { ...form.data.theme, accent: next });
    };

    const setBackground = (next: FaqBackground) => {
        form.setData('theme', { ...form.data.theme, background: next });
    };

    // Live slug-availability check. Debounced fetch against
    // `customize.preview-slug` whenever the name changes so the user
    // sees their resulting public URL before they save.
    type SlugCheck = {
        baseSlug: string;
        finalSlug: string;
        available: boolean;
        unchanged: boolean;
        forName: string;
    };
    const [slugCheck, setSlugCheck] = useState<SlugCheck | null>(null);
    const trimmedName = form.data.name.trim();
    // Show "checking" while we're waiting on a result for the current name
    // (or the name is empty, in which case no indicator at all).
    const slugInfo =
        slugCheck && slugCheck.forName === trimmedName ? slugCheck : null;
    const slugChecking = trimmedName !== '' && slugInfo === null;

    useEffect(() => {
        if (trimmedName === '') {
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            const url = `${previewSlugRoute({ current_team: team.slug }).url}?name=${encodeURIComponent(trimmedName)}`;

            fetch(url, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                signal: controller.signal,
                credentials: 'same-origin',
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('check failed');
                    }

                    return response.json() as Promise<{
                        baseSlug: string;
                        finalSlug: string;
                        available: boolean;
                        unchanged: boolean;
                    }>;
                })
                .then((data) => {
                    setSlugCheck({ ...data, forName: trimmedName });
                })
                .catch((error: unknown) => {
                    if (
                        error instanceof DOMException &&
                        error.name === 'AbortError'
                    ) {
                        return;
                    }
                    // Swallow: the indicator simply stays in the "checking"
                    // state until the user changes the name again.
                });
        }, 350);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [trimmedName, team.slug]);

    const isDirty =
        form.data.name !== team.name ||
        form.data.headline !== (team.headline ?? '') ||
        form.data.tagline !== (team.tagline ?? '') ||
        form.data.template !== team.template ||
        normalizeHex(form.data.theme.accent).toLowerCase() !==
            normalizeHex(initialTheme.accent).toLowerCase() ||
        form.data.theme.background !== initialTheme.background;

    const accentValid = isValidHex(form.data.theme.accent);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!accentValid) {
            toast.error(t('customize.toast.invalid_accent'));

            return;
        }

        form.transform((data) => ({
            name: data.name.trim(),
            headline: data.headline.trim() === '' ? null : data.headline.trim(),
            tagline: data.tagline.trim() === '' ? null : data.tagline.trim(),
            template: data.template,
            theme: {
                accent: normalizeHex(data.theme.accent),
                background: data.theme.background,
            },
        }));

        form.patch(updateCustomize({ current_team: team.slug }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('customize.toast.saved'));
            },
            onError: () => {
                toast.error(t('customize.toast.failed'));
            },
        });
    };

    const handleReset = () => {
        form.reset();
        form.clearErrors();
    };

    return (
        <>
            <Head title={t('customize.title')} />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-10 pb-24 sm:px-7 sm:pt-14 lg:px-9">
                <Masthead
                    teamName={form.data.name.trim() || team.name}
                    publicUrl={publicUrl}
                />

                <div
                    aria-hidden="true"
                    className="editorial-rule mt-10 h-px w-full"
                />

                <form
                    onSubmit={handleSubmit}
                    className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12"
                >
                    <section className="lg:col-span-5 lg:max-w-[28rem]">
                        <SectionHeader
                            eyebrow={t('customize.sections.copy_eyebrow')}
                            title={t('customize.sections.copy_title')}
                            description={t(
                                'customize.sections.copy_description',
                            )}
                        />

                        <div className="mt-6 flex flex-col gap-5">
                            <div>
                                <Label
                                    htmlFor="team-name"
                                    className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase"
                                >
                                    {t('customize.fields.team_name_label')}
                                </Label>
                                <Input
                                    id="team-name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    maxLength={255}
                                    required
                                    autoComplete="off"
                                    className="mt-2 h-10"
                                />
                                {form.errors.name ? (
                                    <p
                                        role="alert"
                                        className="mt-2 font-mono text-[11px] tracking-wide text-destructive"
                                    >
                                        {form.errors.name}
                                    </p>
                                ) : null}
                                <p className="mt-1.5 text-[11px] text-muted-foreground">
                                    {t('customize.fields.team_name_help')}
                                </p>
                                <SlugIndicator
                                    checking={slugChecking}
                                    info={slugInfo}
                                    currentSlug={team.slug}
                                />
                            </div>

                            <div>
                                <Label
                                    htmlFor="team-headline"
                                    className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase"
                                >
                                    {t('customize.fields.headline_label')}
                                </Label>
                                <Input
                                    id="team-headline"
                                    value={form.data.headline}
                                    onChange={(event) =>
                                        form.setData(
                                            'headline',
                                            event.target.value,
                                        )
                                    }
                                    maxLength={80}
                                    placeholder={team.name}
                                    autoComplete="off"
                                    className="mt-2 h-10"
                                />
                                {form.errors.headline ? (
                                    <p
                                        role="alert"
                                        className="mt-2 font-mono text-[11px] tracking-wide text-destructive"
                                    >
                                        {form.errors.headline}
                                    </p>
                                ) : null}
                                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>
                                        {t('customize.fields.headline_help')}
                                    </span>
                                    <span className="font-mono">
                                        {form.data.headline.length}/80
                                    </span>
                                </div>
                            </div>

                            <div>
                                <Label
                                    htmlFor="team-tagline"
                                    className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase"
                                >
                                    {t('customize.fields.tagline_label')}
                                </Label>
                                <textarea
                                    id="team-tagline"
                                    value={form.data.tagline}
                                    onChange={(event) =>
                                        form.setData(
                                            'tagline',
                                            event.target.value,
                                        )
                                    }
                                    maxLength={280}
                                    rows={3}
                                    placeholder={t(
                                        'customize.fields.tagline_placeholder',
                                    )}
                                    className={cn(
                                        'mt-2 block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm',
                                        'placeholder:text-muted-foreground',
                                        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
                                    )}
                                />
                                {form.errors.tagline ? (
                                    <p
                                        role="alert"
                                        className="mt-2 font-mono text-[11px] tracking-wide text-destructive"
                                    >
                                        {form.errors.tagline}
                                    </p>
                                ) : null}
                                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>
                                        {t('customize.fields.tagline_help')}
                                    </span>
                                    <span className="font-mono">
                                        {form.data.tagline.length}/280
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div
                            aria-hidden="true"
                            className="editorial-rule mt-10 h-px w-full"
                        />

                        <SectionHeader
                            className="mt-10"
                            eyebrow={t('customize.sections.layout_eyebrow')}
                            title={t('customize.sections.layout_title')}
                            description={t(
                                'customize.sections.layout_description',
                            )}
                        />

                        <div className="mt-6">
                            <TemplatePicker
                                value={form.data.template}
                                onChange={setTemplate}
                                options={templates}
                            />
                        </div>

                        {form.errors.template ? (
                            <p
                                role="alert"
                                className="mt-3 font-mono text-[11px] tracking-wide text-destructive"
                            >
                                {form.errors.template}
                            </p>
                        ) : null}

                        <div
                            aria-hidden="true"
                            className="editorial-rule mt-10 h-px w-full"
                        />

                        <SectionHeader
                            className="mt-10"
                            eyebrow={t('customize.sections.theme_eyebrow')}
                            title={t('customize.sections.theme_title')}
                            description={t(
                                'customize.sections.theme_description',
                            )}
                        />

                        <div className="mt-6">
                            <ThemePicker
                                accent={form.data.theme.accent}
                                background={form.data.theme.background}
                                backgrounds={backgrounds}
                                onAccentChange={setAccent}
                                onBackgroundChange={setBackground}
                            />
                        </div>

                        {(form.errors['theme.accent'] ??
                        form.errors['theme.background']) ? (
                            <p
                                role="alert"
                                className="mt-3 font-mono text-[11px] tracking-wide text-destructive"
                            >
                                {form.errors['theme.accent'] ??
                                    form.errors['theme.background']}
                            </p>
                        ) : null}

                        <div
                            aria-hidden="true"
                            className="editorial-rule mt-10 h-px w-full"
                        />

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Button
                                type="submit"
                                disabled={form.processing || !isDirty}
                                className="min-h-[44px] gap-2 rounded-full px-6 font-mono text-[11px] tracking-[0.22em] uppercase"
                            >
                                {form.processing ? (
                                    t('customize.actions.saving')
                                ) : (
                                    <>
                                        <Check className="size-4" />
                                        {t('customize.actions.save_changes')}
                                    </>
                                )}
                            </Button>

                            {isDirty ? (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="min-h-[44px] font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase underline-offset-4 hover:text-foreground hover:underline"
                                >
                                    {t('customize.actions.discard')}
                                </button>
                            ) : null}

                            {form.recentlySuccessful ? (
                                <span
                                    role="status"
                                    className="font-mono text-[10px] tracking-[0.22em] text-[var(--accent-ink)] uppercase"
                                >
                                    {t('customize.actions.saved')}
                                </span>
                            ) : null}
                        </div>
                    </section>

                    <aside className="lg:col-span-7">
                        <div className="lg:sticky lg:top-6">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <SectionHeader
                                    eyebrow={t(
                                        'customize.sections.preview_eyebrow',
                                    )}
                                    title={t(
                                        'customize.sections.preview_title',
                                    )}
                                    compact
                                />
                                <DeviceToggle
                                    device={device}
                                    onChange={setDevice}
                                />
                            </div>

                            <PreviewFrame
                                device={device}
                                template={form.data.template}
                                theme={
                                    accentValid
                                        ? form.data.theme
                                        : {
                                              ...form.data.theme,
                                              accent: DEFAULT_THEME.accent,
                                          }
                                }
                                teamName={form.data.name.trim() || team.name}
                                teamHeadline={form.data.headline}
                                teamTagline={form.data.tagline}
                                teamSlug={team.slug}
                            />

                            <p className="mt-3 max-w-prose text-[11px] leading-relaxed text-muted-foreground">
                                {t('customize.preview.description')}
                            </p>
                        </div>
                    </aside>
                </form>
            </div>

            <PreviewStyles />
        </>
    );
}

function Masthead({
    teamName,
    publicUrl,
}: {
    teamName: string;
    publicUrl: string;
}) {
    const { t } = useTranslate();

    return (
        <header className="flex flex-col gap-7">
            <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.32em] text-foreground/60 uppercase">
                <span
                    aria-hidden="true"
                    className="inline-block size-1.5 rounded-full bg-[var(--accent-ink)]"
                />
                {t('customize.masthead.eyebrow')}
                <span aria-hidden="true" className="text-border">
                    &middot;
                </span>
                <span className="text-foreground/55">
                    {t('customize.masthead.eyebrow_section')}
                </span>
            </div>

            <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
                <div>
                    <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
                        {t('customize.masthead.title_lead')}{' '}
                        <span className="whitespace-nowrap">
                            {teamName}
                            <span className="text-[var(--accent-ink)]">.</span>
                        </span>
                    </h1>
                    <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {t('customize.masthead.description')}
                    </p>
                </div>

                <Link
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 self-end font-mono text-[11px] tracking-[0.22em] text-foreground/70 uppercase hover:text-foreground"
                >
                    <Eye className="size-4" />
                    {t('common.actions.view_public_page')}
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
            </div>
        </header>
    );
}

function SectionHeader({
    eyebrow,
    title,
    description,
    compact = false,
    className,
}: {
    eyebrow: string;
    title: string;
    description?: string;
    compact?: boolean;
    className?: string;
}) {
    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <span className="font-mono text-[10px] tracking-[0.28em] text-foreground/60 uppercase">
                {eyebrow}
            </span>
            <h2
                className={cn(
                    'font-display font-semibold tracking-tight text-foreground',
                    compact ? 'text-xl' : 'text-2xl sm:text-[1.7rem]',
                )}
            >
                {title}
            </h2>
            {description ? (
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            ) : null}
        </div>
    );
}

function SlugIndicator({
    checking,
    info,
    currentSlug,
}: {
    checking: boolean;
    info: {
        baseSlug: string;
        finalSlug: string;
        available: boolean;
        unchanged: boolean;
    } | null;
    currentSlug: string;
}) {
    const { t } = useTranslate();

    if (checking) {
        return (
            <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-muted-foreground">
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                {t('customize.slug.checking')}
            </p>
        );
    }

    if (!info) {
        return null;
    }

    if (info.unchanged) {
        return (
            <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-muted-foreground">
                {t('customize.slug.unchanged', { slug: info.finalSlug })}
            </p>
        );
    }

    if (info.available) {
        return (
            <div className="mt-2 flex flex-col gap-1">
                <p className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-[var(--accent-ink)]">
                    <Check className="size-3" aria-hidden="true" />
                    {t('customize.slug.available', { slug: info.finalSlug })}
                </p>
                <p className="text-[11px] leading-snug text-muted-foreground">
                    {t('customize.slug.rename_warning', {
                        current: currentSlug,
                    })}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-2 flex flex-col gap-1">
            <p className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-3" aria-hidden="true" />
                {t('customize.slug.taken', {
                    base: info.baseSlug,
                    slug: info.finalSlug,
                })}
            </p>
            <p className="text-[11px] leading-snug text-muted-foreground">
                {t('customize.slug.rename_warning', {
                    current: currentSlug,
                })}
            </p>
        </div>
    );
}

function DeviceToggle({
    device,
    onChange,
}: {
    device: DeviceFrame;
    onChange: (next: DeviceFrame) => void;
}) {
    const { t } = useTranslate();

    return (
        <div
            role="radiogroup"
            aria-label={t('customize.preview.device_aria')}
            className="inline-flex rounded-full border border-border/70 bg-card/40 p-0.5 font-mono text-[10px] tracking-[0.22em] uppercase"
        >
            {(['desktop', 'mobile'] as const).map((value) => {
                const selected = device === value;
                const Icon = value === 'desktop' ? Monitor : Smartphone;
                const label =
                    value === 'desktop'
                        ? t('customize.preview.desktop')
                        : t('customize.preview.mobile');

                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(value)}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors',
                            selected
                                ? 'bg-foreground text-background'
                                : 'text-foreground/70 hover:text-foreground',
                        )}
                    >
                        <Icon className="size-3.5" />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

/** Natural rendering width per device. The template renders at this width
 * so Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`) fire authentically.
 * The wrapper then scales the result down to fit the available space. */
const PREVIEW_NATURAL_WIDTH: Record<DeviceFrame, number> = {
    desktop: 1280,
    mobile: 390,
};

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

function PreviewFrame({
    device,
    template,
    theme,
    teamName,
    teamHeadline,
    teamTagline,
    teamSlug,
}: {
    device: DeviceFrame;
    template: FaqTemplateKey;
    theme: FaqTheme;
    teamName: string;
    teamHeadline: string;
    teamTagline: string;
    teamSlug: string;
}) {
    const { t } = useTranslate();
    const previewTeam = {
        name: teamName,
        slug: teamSlug,
        headline: teamHeadline.trim() === '' ? null : teamHeadline.trim(),
        tagline: teamTagline.trim() === '' ? null : teamTagline.trim(),
    };

    const TemplateComponent =
        template === 'grid'
            ? GridTemplate
            : template === 'timeline'
              ? TimelineTemplate
              : MinimalTemplate;

    const naturalWidth = PREVIEW_NATURAL_WIDTH[device];

    const containerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    // Width of the visible preview area — used to compute the fit-to-width
    // scale. Updated via ResizeObserver as the layout / window changes.
    const [containerWidth, setContainerWidth] = useState<number>(800);
    // Natural (unscaled) height of the rendered template. Lets us collapse
    // the parent wrapper to the scaled height so layout below doesn't get
    // pushed by the un-transformed box.
    const [naturalHeight, setNaturalHeight] = useState<number>(2000);
    // null = follow fit-to-width; a number = user has opted into a fixed zoom.
    const [zoomOverride, setZoomOverride] = useState<number | null>(null);

    useEffect(() => {
        const el = containerRef.current;

        if (!el) {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            const next = entries[0]?.contentRect.width;

            if (typeof next === 'number') {
                setContainerWidth(next);
            }
        });
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const el = innerRef.current;

        if (!el) {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            const next = entries[0]?.contentRect.height;

            if (typeof next === 'number') {
                setNaturalHeight(next);
            }
        });
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    // Reset any user zoom when switching device — fit feels right by default.
    // Uses the React "Adjusting state when a prop changes" pattern so we don't
    // bounce off `react-hooks/set-state-in-effect`.
    const [prevDevice, setPrevDevice] = useState<DeviceFrame>(device);

    if (prevDevice !== device) {
        setPrevDevice(device);
        setZoomOverride(null);
    }

    const fitScale = Math.min(1, containerWidth / naturalWidth);
    const scale = zoomOverride ?? fitScale;
    const scaledHeight = naturalHeight * scale;
    const zoomPercent = Math.round(scale * 100);
    const isZoomed = zoomOverride !== null;

    const clamp = (value: number) =>
        Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));

    const zoomIn = () =>
        setZoomOverride((current) => clamp((current ?? fitScale) + ZOOM_STEP));
    const zoomOut = () =>
        setZoomOverride((current) => clamp((current ?? fitScale) - ZOOM_STEP));
    const resetZoom = () => setZoomOverride(null);

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl border border-border/70 bg-card/30 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)] transition-all',
            )}
        >
            <div
                aria-hidden="true"
                className="flex items-center justify-between gap-2 border-b border-border/60 bg-background/40 px-4 py-2"
            >
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="size-2 rounded-full bg-foreground/15" />
                    <span className="size-2 rounded-full bg-foreground/15" />
                    <span className="size-2 rounded-full bg-foreground/15" />
                    <span className="ml-3 truncate font-mono text-[10px] tracking-[0.18em] text-foreground/55 uppercase">
                        asked.app/{teamSlug}
                    </span>
                </div>
                <div className="flex shrink-0 items-center gap-1 font-mono text-[10px] tracking-[0.18em] text-foreground/65 uppercase">
                    <button
                        type="button"
                        onClick={zoomOut}
                        aria-label={t('customize.preview.zoom_out')}
                        disabled={scale <= ZOOM_MIN + 0.001}
                        className="inline-flex size-7 items-center justify-center rounded-full text-foreground/65 transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
                    >
                        <Minus className="size-3" aria-hidden="true" />
                    </button>
                    <span
                        aria-live="polite"
                        className="min-w-[3.25rem] text-center tabular-nums"
                    >
                        {t('customize.preview.zoom_value', {
                            percent: zoomPercent,
                        })}
                    </span>
                    <button
                        type="button"
                        onClick={zoomIn}
                        aria-label={t('customize.preview.zoom_in')}
                        disabled={scale >= ZOOM_MAX - 0.001}
                        className="inline-flex size-7 items-center justify-center rounded-full text-foreground/65 transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
                    >
                        <Plus className="size-3" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={resetZoom}
                        aria-label={t('customize.preview.fit')}
                        disabled={!isZoomed}
                        className="ml-1 inline-flex size-7 items-center justify-center rounded-full text-foreground/65 transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
                    >
                        <Maximize2 className="size-3" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div
                ref={containerRef}
                className="preview-scroll relative max-h-[78vh] overflow-auto"
                aria-label={t('customize.preview.aria_label')}
            >
                {/* Wrapper sized to the SCALED footprint so the parent column
                    doesn't reserve the natural (unscaled) box's height. */}
                <div
                    style={{
                        width: naturalWidth * scale,
                        height: scaledHeight,
                    }}
                    className="mx-auto"
                >
                    <div
                        ref={innerRef}
                        className="editorial-faq-root preview-root relative isolate origin-top-left"
                        style={{
                            width: naturalWidth,
                            transform: `scale(${scale})`,
                            ...themeStyleVariables(theme),
                        }}
                    >
                        <TemplateComponent
                            team={previewTeam}
                            questions={PREVIEW_QUESTIONS}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Sets up the FAQ root font + token routing so the preview matches what
 * `pages/faq/show.tsx` renders. Scoped to `.preview-root` instances inside
 * the customize page only.
 */
function PreviewStyles() {
    return (
        <style>{`
            .preview-root {
                font-family: 'Fraunces', ui-serif, Georgia, serif;
                --background: var(--page-bg);
                --foreground: var(--page-ink);
                --card: var(--page-surface);
                --card-foreground: var(--page-ink);
                --popover: var(--page-surface);
                --popover-foreground: var(--page-ink);
                --primary: var(--accent-ink);
                --primary-foreground: var(--accent-foreground);
                --muted: color-mix(in oklch, var(--page-ink) 6%, transparent);
                --muted-foreground: var(--page-muted);
                --accent: color-mix(in oklch, var(--accent-ink) 12%, transparent);
                --border: var(--page-border);
                --input: var(--page-border);
                --ring: var(--accent-ink);
            }
            .preview-root .font-display {
                font-family: 'Fraunces', ui-serif, Georgia, serif;
                font-feature-settings: 'ss01', 'ss02';
            }
            .preview-root .font-mono {
                font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
            }
            .preview-scroll {
                scrollbar-width: thin;
                scrollbar-color: oklch(0.5 0 0 / 0.25) transparent;
            }
        `}</style>
    );
}
