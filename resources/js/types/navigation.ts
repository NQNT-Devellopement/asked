import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    /**
     * Optional small numeric badge rendered to the right of the item label
     * in the sidebar. Saffron when > 0, muted otherwise.
     */
    badge?: number | null;
    /**
     * Optional editorial-style "section number" rendered as a tiny mono prefix
     * before the title (e.g. "01", "02"). Stable across renders.
     */
    section?: string;
};
