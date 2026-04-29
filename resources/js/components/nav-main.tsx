import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

type NavMainProps = {
    label?: string;
    items: NavItem[];
};

export function NavMain({ label, items = [] }: NavMainProps) {
    const { isCurrentUrl } = useCurrentUrl();
    const { t } = useTranslate();
    const resolvedLabel = label ?? t('app.sidebar.newsroom_default_label');

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{resolvedLabel}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item, index) => {
                    const active = isCurrentUrl(item.href);
                    const sectionNumber = (index + 1)
                        .toString()
                        .padStart(2, '0');

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    className="!h-9"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'font-mono text-[9px] tracking-[0.22em] tabular-nums',
                                            active
                                                ? 'text-[var(--accent-ink)]'
                                                : 'text-foreground/35',
                                        )}
                                    >
                                        {sectionNumber}
                                    </span>
                                    <span
                                        className={cn(
                                            'font-display text-[15px] tracking-tight',
                                            active
                                                ? 'text-foreground'
                                                : 'text-foreground/80',
                                        )}
                                    >
                                        {item.title}
                                    </span>
                                    {typeof item.badge === 'number' &&
                                    item.badge !== null ? (
                                        <NavBadge
                                            value={item.badge}
                                            active={active}
                                        />
                                    ) : null}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function NavBadge({ value, active }: { value: number; active: boolean }) {
    const isPositive = value > 0;

    return (
        <span
            aria-hidden={!isPositive}
            className={cn(
                'ml-auto inline-flex h-[18px] min-w-[22px] items-center justify-center rounded-full',
                'border px-1.5 font-mono text-[9px] tracking-[0.18em] uppercase tabular-nums',
                'group-data-[collapsible=icon]:hidden',
                isPositive
                    ? active
                        ? 'border-[var(--accent-ink)]/60 bg-[var(--accent-ink)]/15 text-[var(--accent-ink)]'
                        : 'border-[var(--accent-ink)]/40 bg-[var(--accent-ink)]/10 text-[var(--accent-ink)]'
                    : 'border-foreground/10 text-foreground/40',
            )}
        >
            {value > 99 ? '99+' : value.toString().padStart(2, '0')}
        </span>
    );
}
