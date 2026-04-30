import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Inbox,
    LayoutGrid,
    ListTodo,
    Palette,
    Radio,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslate } from '@/lib/i18n';
import { dashboard } from '@/routes';
import { edit as customizeEdit } from '@/routes/customize';
import { index as docsIndex } from '@/routes/docs';
import {
    board as questionsBoard,
    inbox as questionsInbox,
} from '@/routes/questions';
import { index as streamIndex } from '@/routes/stream';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const { t } = useTranslate();
    const currentTeam = page.props.currentTeam;
    const questionStats = page.props.questionStats;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    const mainNavItems: NavItem[] = [
        {
            title: t('app.nav.dashboard'),
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        ...(currentTeam
            ? [
                  {
                      title: t('app.nav.inbox'),
                      href: questionsInbox(currentTeam.slug).url,
                      icon: Inbox,
                      badge: questionStats?.pendingCount ?? null,
                  },
                  {
                      title: t('app.nav.questions'),
                      href: questionsBoard(currentTeam.slug).url,
                      icon: ListTodo,
                  },
              ]
            : []),
        ...(currentTeam &&
        (currentTeam.role === 'owner' || currentTeam.role === 'admin')
            ? [
                  {
                      title: t('app.nav.live'),
                      href: streamIndex(currentTeam.slug).url,
                      icon: Radio,
                  },
              ]
            : []),
        ...(currentTeam && currentTeam.role === 'owner'
            ? [
                  {
                      title: t('app.nav.customize'),
                      href: customizeEdit(currentTeam.slug).url,
                      icon: Palette,
                  },
              ]
            : []),
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t('app.nav.documentation'),
            href: docsIndex().url,
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="gap-3 pt-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu className="group-data-[collapsible=icon]:hidden">
                    <SidebarMenuItem>
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-4 pt-4">
                <NavMain
                    label={t('app.sidebar.group_label')}
                    items={mainNavItems}
                />
            </SidebarContent>

            <SidebarFooter className="gap-3 pb-3">
                <NavFooter
                    items={footerNavItems}
                    label={t('app.sidebar.footer_label')}
                    className="mt-auto"
                />
                <div className="px-2 group-data-[collapsible=icon]:hidden">
                    <LocaleSwitcher align="start" />
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
