import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { useTranslate } from '@/lib/i18n';
import type { Team, User } from '@/types';

/**
 * The user-byline strip that lives in the bottom of the sidebar and inside
 * the user dropdown header. Reads as "Filed by — Name / Team" so it feels
 * like an author byline, not a SaaS account chip.
 */
export function UserInfo({
    user,
    showEmail = false,
    team = null,
}: {
    user: User;
    showEmail?: boolean;
    team?: Team | null;
}) {
    const getInitials = useInitials();
    const { t } = useTranslate();
    const showAvatar = Boolean(user.avatar && user.avatar !== '');

    return (
        <>
            <Avatar className="size-9 overflow-hidden rounded-sm border border-foreground/15 bg-foreground/[0.04]">
                {showAvatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="font-display rounded-sm bg-transparent text-sm font-semibold text-foreground/80">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
                <span className="font-mono text-[8px] tracking-[0.32em] text-foreground/45 uppercase">
                    {t('app.user_info.filed_by')}
                </span>
                <span className="font-display mt-0.5 truncate text-sm font-semibold text-foreground">
                    {user.name}
                </span>
                {team ? (
                    <span className="mt-0.5 truncate font-mono text-[9px] tracking-[0.22em] text-foreground/55 uppercase">
                        {team.name}
                    </span>
                ) : null}
                {!team && showEmail ? (
                    <span className="mt-0.5 truncate font-mono text-[9px] tracking-[0.22em] text-foreground/55 lowercase">
                        {user.email}
                    </span>
                ) : null}
            </div>
        </>
    );
}
