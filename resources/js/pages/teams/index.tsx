import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { Eye, Pencil, Plus } from 'lucide-react';
import CreateTeamModal from '@/components/create-team-modal';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslate } from '@/lib/i18n';
import { index } from '@/routes/teams';
import { edit } from '@/routes/teams';
import type { Team } from '@/types';

type Props = {
    teams: Team[];
};

export default function TeamsIndex({ teams }: Props) {
    const { t } = useTranslate();

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('teams.index.breadcrumb'),
                href: index(),
            },
        ],
    });

    return (
        <>
            <Head title={t('teams.index.page_title')} />

            <h1 className="sr-only">{t('teams.index.page_title')}</h1>

            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title={t('teams.index.section_title')}
                        description={t('teams.index.section_description')}
                    />

                    <CreateTeamModal>
                        <Button data-test="teams-new-team-button">
                            <Plus /> {t('teams.index.new_team')}
                        </Button>
                    </CreateTeamModal>
                </div>

                <div className="space-y-3">
                    {teams.map((team) => (
                        <div
                            key={team.id}
                            data-test="team-row"
                            className="flex items-center justify-between rounded-lg border p-4"
                        >
                            <div className="flex items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {team.name}
                                        </span>
                                        {team.isPersonal ? (
                                            <Badge variant="secondary">
                                                {t(
                                                    'teams.index.personal_badge',
                                                )}
                                            </Badge>
                                        ) : null}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {team.roleLabel}
                                    </span>
                                </div>
                            </div>

                            <TooltipProvider>
                                <div className="flex items-center gap-2">
                                    {team.role === 'member' ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    data-test="team-view-button"
                                                    asChild
                                                >
                                                    <Link
                                                        href={edit(team.slug)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    {t('teams.index.view_team')}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    data-test="team-edit-button"
                                                    asChild
                                                >
                                                    <Link
                                                        href={edit(team.slug)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    {t('teams.index.edit_team')}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </TooltipProvider>
                        </div>
                    ))}

                    {teams.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">
                            {t('teams.index.empty')}
                        </p>
                    ) : null}
                </div>
            </div>
        </>
    );
}
