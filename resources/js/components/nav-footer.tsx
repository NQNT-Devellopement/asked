import { Link } from '@inertiajs/react';
import type { ComponentPropsWithoutRef } from 'react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

type Props = ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
    label?: string;
};

/**
 * Marginalia — auxiliary external links printed under a dashed rule. Visible
 * weight is intentionally lighter than the main nav so they read as endnotes,
 * not headlines.
 */
export function NavFooter({ items, className, label, ...props }: Props) {
    const { t } = useTranslate();
    const resolvedLabel = label ?? t('app.sidebar.footer_label');

    return (
        <SidebarGroup
            {...props}
            className={cn(
                'group-data-[collapsible=icon]:p-0',
                'relative px-2 pt-3',
                className,
            )}
        >
            <div
                aria-hidden="true"
                className="editorial-rule absolute inset-x-3 top-0 h-px group-data-[collapsible=icon]:hidden"
            />
            <SidebarGroupLabel>{resolvedLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const href = toUrl(item.href);
                        const isExternal = /^https?:\/\//i.test(href);

                        const content = (
                            <>
                                {item.icon ? (
                                    <item.icon className="size-3.5 text-foreground/40" />
                                ) : null}
                                <span className="font-mono text-[10px] tracking-[0.22em] text-foreground/55 uppercase">
                                    {item.title}
                                </span>
                            </>
                        );

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: item.title }}
                                >
                                    {isExternal ? (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="!h-8"
                                        >
                                            {content}
                                        </a>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            prefetch
                                            className="!h-8"
                                        >
                                            {content}
                                        </Link>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
