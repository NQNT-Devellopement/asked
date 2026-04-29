import { router, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { toast } from 'sonner';
import CreateTeamModal from '@/components/create-team-modal';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { switchMethod } from '@/routes/teams';
import type { Team } from '@/types';

type TeamSwitcherProps = {
    inHeader?: boolean;
};

/**
 * Stable, playful issue/volume number derived from team id so the masthead
 * has a tabular badge that doesn't shift between visits.
 */
function issueNumber(teamId: number | undefined): string {
    if (!teamId) {
        return '00';
    }

    return ((teamId % 99) + 1).toString().padStart(2, '0');
}

export function TeamSwitcher({ inHeader = false }: TeamSwitcherProps) {
    const page = usePage();
    const { t } = useTranslate();
    const isMobile = useIsMobile();
    const currentTeam = page.props.currentTeam;
    const teams = page.props.teams ?? [];

    const switchTeam = (team: Team) => {
        const previousTeamSlug = currentTeam?.slug;

        router.visit(switchMethod(team.slug), {
            onError: () => {
                toast.error(t('app.team_switcher.toast_failed'));
            },
            onFinish: () => {
                if (!previousTeamSlug || typeof window === 'undefined') {
                    router.reload();

                    return;
                }

                const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
                const segment = `/${previousTeamSlug}`;

                if (currentUrl.includes(segment)) {
                    router.visit(currentUrl.replace(segment, `/${team.slug}`), {
                        replace: true,
                    });

                    return;
                }

                router.reload();
            },
        });
    };

    const issue = issueNumber(currentTeam?.id);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    data-test="team-switcher-trigger"
                    className={
                        inHeader
                            ? 'h-9 gap-2 px-2'
                            : cn(
                                  'group/team h-auto w-full justify-start rounded-none border border-foreground/10',
                                  'bg-transparent px-3 py-2.5 text-left transition-colors',
                                  'hover:border-foreground/25 hover:bg-foreground/[0.02]',
                                  'data-[state=open]:border-foreground/30 data-[state=open]:bg-foreground/[0.03]',
                                  'group-data-[collapsible=icon]:px-1.5',
                              )
                    }
                >
                    <div
                        className={
                            inHeader
                                ? 'grid flex-1 text-left leading-tight'
                                : 'grid flex-1 leading-tight group-data-[collapsible=icon]:hidden'
                        }
                    >
                        <span
                            className={cn(
                                'font-mono uppercase',
                                inHeader
                                    ? 'text-[9px] tracking-[0.28em] text-foreground/55'
                                    : 'text-[8px] tracking-[0.32em] text-foreground/55',
                            )}
                        >
                            {t('app.team_switcher.volume', { issue })}
                            <span aria-hidden="true" className="mx-1.5">
                                /
                            </span>
                            {t('app.team_switcher.masthead_label')}
                        </span>
                        <span
                            className={cn(
                                'font-display mt-1 truncate font-semibold',
                                inHeader
                                    ? 'max-w-[140px] text-sm text-foreground'
                                    : 'text-base text-foreground',
                            )}
                        >
                            {currentTeam?.name ??
                                t('app.team_switcher.select_team')}
                        </span>
                    </div>
                    <span
                        aria-hidden="true"
                        className={
                            inHeader
                                ? 'hidden'
                                : 'hidden size-2 rounded-full bg-[var(--accent-ink)] group-data-[collapsible=icon]:block'
                        }
                    />
                    <ChevronsUpDown
                        className={cn(
                            'size-3.5 text-foreground/45 transition-transform group-data-[state=open]/team:rotate-180',
                            inHeader
                                ? ''
                                : 'ml-auto group-data-[collapsible=icon]:hidden',
                        )}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={
                    inHeader
                        ? 'w-64 rounded-md'
                        : 'w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-md'
                }
                side={inHeader ? undefined : isMobile ? 'bottom' : 'right'}
                align={inHeader ? 'end' : 'start'}
                sideOffset={inHeader ? undefined : 8}
            >
                <DropdownMenuLabel className="font-mono text-[9px] tracking-[0.32em] text-muted-foreground uppercase">
                    {t('app.team_switcher.mastheads_on_file')}
                </DropdownMenuLabel>
                {teams.map((team) => (
                    <DropdownMenuItem
                        key={team.id}
                        data-test="team-switcher-item"
                        className="cursor-pointer gap-2 py-2"
                        onSelect={() => switchTeam(team)}
                    >
                        <span className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground uppercase tabular-nums">
                            {issueNumber(team.id)}
                        </span>
                        <span className="font-display flex-1 truncate text-sm">
                            {team.name}
                        </span>
                        {currentTeam?.id === team.id ? (
                            <Check className="size-3.5 text-[var(--accent-ink)]" />
                        ) : null}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <CreateTeamModal>
                    <DropdownMenuItem
                        data-test="team-switcher-new-team"
                        className="cursor-pointer gap-2 py-2 font-mono text-[10px] tracking-[0.22em] uppercase"
                        onSelect={(event) => event.preventDefault()}
                    >
                        <Plus className="size-3.5" />
                        <span>{t('app.team_switcher.open_new_masthead')}</span>
                    </DropdownMenuItem>
                </CreateTeamModal>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
