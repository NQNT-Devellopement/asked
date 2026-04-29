import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import { AuthStatus } from '@/components/auth/auth-status';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTranslate } from '@/lib/i18n';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslate();

    setLayoutProps({
        title: t('auth.verify_email.page_title'),
        description: t('auth.verify_email.page_description'),
    });

    return (
        <>
            <Head title={t('auth.verify_email.head_title')} />

            {status === 'verification-link-sent' ? (
                <AuthStatus message={t('auth.verify_email.status_sent')} />
            ) : null}

            <div className="flex flex-col items-start gap-7">
                <div className="flex items-start gap-4">
                    <span
                        aria-hidden="true"
                        className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--accent-ink)]/35 bg-[var(--accent-ink)]/10 text-[var(--accent-ink)]"
                    >
                        <Mail className="size-5" />
                    </span>
                    <p className="font-display text-base leading-relaxed text-foreground/80">
                        {t('auth.verify_email.lede')}
                    </p>
                </div>

                <Form {...send.form()} className="flex w-full flex-col gap-4">
                    {({ processing }) => (
                        <Button
                            disabled={processing}
                            variant="secondary"
                            className="w-full"
                        >
                            {processing && <Spinner />}
                            {t('auth.verify_email.resend')}
                        </Button>
                    )}
                </Form>

                <div className="flex w-full justify-center border-t border-dashed border-foreground/15 pt-6">
                    <TextLink
                        href={logout()}
                        className="font-mono text-[10px] tracking-[0.28em] text-foreground/65 uppercase no-underline hover:text-foreground"
                    >
                        {t('auth.verify_email.logout')}
                    </TextLink>
                </div>
            </div>
        </>
    );
}
