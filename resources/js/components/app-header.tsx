import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Menu } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { TeamSwitcher } from '@/components/team-switcher';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslate } from '@/lib/i18n';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { t } = useTranslate();
    const { auth, currentTeam } = page.props;
    const { isCurrentUrl } = useCurrentUrl();
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    const mainNavItems: NavItem[] = [
        {
            title: t('app.nav.dashboard'),
            href: dashboardUrl,
            icon: LayoutGrid,
        },
    ];

    const rightNavItems: NavItem[] = [
        {
            title: t('app.nav.repository'),
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: t('app.nav.documentation'),
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <>
            <div className="relative">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-7 lg:px-9">
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 size-9 rounded-full border border-foreground/15"
                                >
                                    <Menu className="size-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-72 flex-col items-stretch justify-between bg-[var(--page-bg)]"
                            >
                                <SheetTitle className="sr-only">
                                    {t('app.header.navigation_menu')}
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogo />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col justify-between gap-6 p-4">
                                    <div className="flex flex-col gap-2">
                                        {mainNavItems.map((item) => (
                                            <Link
                                                key={item.title}
                                                href={item.href}
                                                className="font-display text-base text-foreground"
                                            >
                                                {item.title}
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {rightNavItems.map((item) => (
                                            <a
                                                key={item.title}
                                                href={toUrl(item.href)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-[10px] tracking-[0.28em] text-foreground/60 uppercase"
                                            >
                                                {item.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboardUrl}
                        prefetch
                        className="inline-flex items-center"
                    >
                        <AppLogo />
                    </Link>

                    <nav className="ml-6 hidden items-center gap-5 lg:flex">
                        {mainNavItems.map((item) => {
                            const active = isCurrentUrl(item.href);

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={cn(
                                        'font-display text-sm tracking-tight transition-colors',
                                        active
                                            ? 'text-foreground'
                                            : 'text-foreground/65 hover:text-foreground',
                                    )}
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="ml-auto flex items-center gap-3">
                        <TeamSwitcher inHeader />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="inline-flex h-10 items-center gap-2 rounded-full border border-foreground/15 px-2 hover:border-foreground/35 hover:bg-transparent"
                                >
                                    <UserInfo
                                        user={auth.user}
                                        team={currentTeam}
                                    />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-60" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div
                    aria-hidden="true"
                    className="editorial-rule absolute inset-x-5 bottom-0 h-px sm:inset-x-7 lg:inset-x-9"
                />
            </div>
            {breadcrumbs.length > 1 ? (
                <div className="mx-auto flex h-12 w-full max-w-7xl items-center px-5 sm:px-7 lg:px-9">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            ) : null}
        </>
    );
}
