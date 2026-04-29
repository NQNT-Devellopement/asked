import { Head } from '@inertiajs/react';
import type { FaqQuestion } from '@/components/faq/question-card';
import { GridTemplate } from '@/components/faq/templates/grid-template';
import { MinimalTemplate } from '@/components/faq/templates/minimal-template';
import { TimelineTemplate } from '@/components/faq/templates/timeline-template';
import { useTranslate } from '@/lib/i18n';
import { DEFAULT_THEME, themeStyleVariables } from '@/lib/theme';
import type { FaqTheme } from '@/lib/theme';

type FaqTemplate = 'minimal' | 'grid' | 'timeline';

type FaqShowProps = {
    team: {
        name: string;
        slug: string;
        headline?: string | null;
        tagline?: string | null;
        template?: FaqTemplate;
        theme?: FaqTheme;
    };
    questions: FaqQuestion[];
};

/**
 * Public FAQ page. A thin shell that:
 *   1. Resolves the chosen template (falls back to `minimal`).
 *   2. Emits the scoped CSS variables for the chosen theme.
 *   3. Renders the matching template, which embeds its own QuestionForm.
 *
 * Defensive defaults keep the page rendering even if backend props haven't
 * been fully wired (template/theme can be missing on legacy fixtures).
 */
export default function FaqShow({ team, questions }: FaqShowProps) {
    const { t } = useTranslate();
    const template: FaqTemplate = team.template ?? 'minimal';
    const theme: FaqTheme = team.theme ?? DEFAULT_THEME;

    return (
        <>
            <Head title={t('faq.meta.title', { name: team.name })}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content={t('faq.meta.description', { name: team.name })}
                />
            </Head>

            <FaqRootStyles />

            <div
                className="editorial-faq-root relative isolate min-h-screen antialiased"
                style={themeStyleVariables(theme)}
            >
                {template === 'grid' ? (
                    <GridTemplate
                        team={{
                            name: team.name,
                            slug: team.slug,
                            headline: team.headline,
                            tagline: team.tagline,
                        }}
                        questions={questions}
                    />
                ) : template === 'timeline' ? (
                    <TimelineTemplate
                        team={{
                            name: team.name,
                            slug: team.slug,
                            headline: team.headline,
                            tagline: team.tagline,
                        }}
                        questions={questions}
                    />
                ) : (
                    <MinimalTemplate
                        team={{
                            name: team.name,
                            slug: team.slug,
                            headline: team.headline,
                            tagline: team.tagline,
                        }}
                        questions={questions}
                    />
                )}
            </div>
        </>
    );
}

/**
 * Sets up Fraunces + JetBrains Mono inside the FAQ root and ensures the
 * `font-display` / `font-mono` utility classes route to those families. The
 * palette itself is supplied by `themeStyleVariables` on the wrapper.
 */
function FaqRootStyles() {
    return (
        <style>{`
            .editorial-faq-root {
                font-family: 'Fraunces', ui-serif, Georgia, serif;
                /*
                 * Re-route the global shadcn tokens used by shared components
                 * (QuestionCard, QuestionForm, FaqEmptyState) so they pick up
                 * the per-theme ink/paper instead of the app's default cream.
                 */
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
            .editorial-faq-root .font-display {
                font-family: 'Fraunces', ui-serif, Georgia, serif;
                font-feature-settings: 'ss01', 'ss02';
            }
            .editorial-faq-root .font-mono {
                font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
            }
        `}</style>
    );
}
