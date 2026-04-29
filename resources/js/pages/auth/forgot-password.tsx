import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { ArrowUpRight, LoaderCircle } from 'lucide-react';
import { AuthStatus } from '@/components/auth/auth-status';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslate } from '@/lib/i18n';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslate();

    setLayoutProps({
        title: t('auth.forgot_password.page_title'),
        description: t('auth.forgot_password.page_description'),
    });

    return (
        <>
            <Head title={t('auth.forgot_password.head_title')} />

            <AuthStatus message={status} />

            <Form {...email.form()} className="flex flex-col gap-7">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                {t('auth.forgot_password.email_label')}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="off"
                                autoFocus
                                placeholder={t(
                                    'auth.forgot_password.email_placeholder',
                                )}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}
                            {t('auth.forgot_password.submit')}
                            <ArrowUpRight className="size-4" />
                        </Button>
                    </>
                )}
            </Form>

            <div className="mt-7 border-t border-dashed border-foreground/15 pt-6 text-center text-sm text-muted-foreground">
                <span className="font-mono text-[10px] tracking-[0.28em] uppercase">
                    {t('auth.forgot_password.or_return')}
                </span>{' '}
                <TextLink
                    href={login().url}
                    className="font-display text-base font-medium"
                >
                    {t('auth.forgot_password.login_link')}
                </TextLink>
            </div>
        </>
    );
}
