import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslate } from '@/lib/i18n';
import { destroy as destroyInvitation } from '@/routes/teams/invitations';
import type { Team, TeamInvitation } from '@/types';

type Props = {
    team: Team;
    invitation: TeamInvitation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function CancelInvitationModal({
    team,
    invitation,
    open,
    onOpenChange,
}: Props) {
    const [processing, setProcessing] = useState(false);
    const { t } = useTranslate();

    const cancelInvitation = () => {
        if (!invitation) {
            return;
        }

        router.visit(destroyInvitation([team.slug, invitation.code]), {
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: () => onOpenChange(false),
            onError: () => {
                toast.error(t('teams.cancel_invitation.toast_failed'));
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {t('teams.cancel_invitation.title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('teams.cancel_invitation.description_prefix')}{' '}
                        <strong>{invitation?.email}</strong>
                        {t('teams.cancel_invitation.description_suffix')}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('teams.cancel_invitation.keep')}
                        </Button>
                    </DialogClose>

                    <Button
                        variant="destructive"
                        data-test="cancel-invitation-confirm"
                        disabled={processing}
                        onClick={cancelInvitation}
                    >
                        {t('teams.cancel_invitation.submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
