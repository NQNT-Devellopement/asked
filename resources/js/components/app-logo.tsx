import { useTranslate } from '@/lib/i18n';

/**
 * Sidebar masthead lockup. Reads as the publication's nameplate, not a
 * tech-startup logotype. Shrinks to a single saffron glyph when the sidebar
 * is in icon-only mode so the rail still feels intentional.
 */
export default function AppLogo() {
    const { t } = useTranslate();

    return (
        <div className="flex w-full items-center gap-3 px-1.5 py-1">
            <span
                aria-hidden="true"
                className="font-display flex size-8 shrink-0 items-center justify-center rounded-sm border border-foreground/15 bg-[var(--accent-ink)]/10 text-base leading-none font-semibold text-[var(--accent-ink)]"
            >
                A<span className="text-foreground/80">.</span>
            </span>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="font-mono text-[9px] tracking-[0.32em] text-foreground/50 uppercase">
                    {t('app.logo.eyebrow')}
                </span>
                <span className="font-display mt-0.5 text-base leading-none font-semibold tracking-tight text-foreground">
                    {t('app.logo.name')}
                    <span className="text-[var(--accent-ink)]">.</span>
                </span>
            </div>
        </div>
    );
}
