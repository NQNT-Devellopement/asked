import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

/**
 * Minimal top bar — sidebar trigger as a mono pill chip on the left, then a
 * breadcrumb trail typeset like an editorial dateline. Stays out of the way
 * and lets the page below own the masthead.
 */
export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { t } = useTranslate();
    const last = breadcrumbs[breadcrumbs.length - 1];

    return (
        <header
            className={cn(
                'relative z-10 flex h-14 shrink-0 items-center gap-3 px-5 sm:px-7 lg:px-9',
                'transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
            )}
        >
            <div className="flex items-center gap-2">
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-transparent',
                        'py-0.5 pr-2.5 pl-1 font-mono text-[10px] tracking-[0.22em] text-foreground/70 uppercase',
                        'transition-colors hover:border-foreground/35',
                    )}
                >
                    <SidebarTrigger className="!size-5 rounded-full" />
                    <span className="hidden sm:inline">
                        {t('app.sidebar.desk_chip')}
                    </span>
                </span>
            </div>

            <span
                aria-hidden="true"
                className="hidden h-3 w-px bg-foreground/20 sm:block"
            />

            <div className="flex min-w-0 items-center gap-2">
                {last ? (
                    <span className="font-mono text-[10px] tracking-[0.32em] text-foreground/55 uppercase">
                        {t('app.breadcrumbs.filed_under')}
                    </span>
                ) : null}
                <div className="hidden min-w-0 sm:block">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                {last ? (
                    <span className="font-display truncate text-sm font-medium text-foreground sm:hidden">
                        {last.title}
                    </span>
                ) : null}
            </div>

            <div
                aria-hidden="true"
                className="editorial-rule absolute inset-x-5 bottom-0 h-px sm:inset-x-7 lg:inset-x-9"
            />
        </header>
    );
}
