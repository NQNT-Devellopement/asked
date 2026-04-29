import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { AuthStatus } from '@/components/auth/auth-status';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslate } from '@/lib/i18n';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const { t } = useTranslate();

    setLayoutProps({
        title: t('auth.login.page_title'),
        description: t('auth.login.page_description'),
    });

    return (
        <>
            <Head title={t('auth.login.head_title')} />

            <AuthStatus message={status} />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-7"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-7">
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('auth.login.email_label')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder={t(
                                        'auth.login.email_placeholder',
                                    )}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">
                                        {t('auth.login.password_label')}
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request().url}
                                            className="font-mono text-[10px] tracking-[0.22em] text-foreground/65 uppercase no-underline hover:text-foreground"
                                            tabIndex={5}
                                        >
                                            {t('auth.login.forgot')}
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder={t(
                                        'auth.login.password_placeholder',
                                    )}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <label className="flex items-center gap-3 text-sm text-foreground/75">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <span className="font-mono text-[10px] tracking-[0.22em] text-foreground/70 uppercase">
                                    {t('auth.login.remember')}
                                </span>
                            </label>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                {t('auth.login.submit')}
                                <ArrowUpRight className="size-4" />
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="border-t border-dashed border-foreground/15 pt-6 text-center text-sm text-muted-foreground">
                                <span className="font-mono text-[10px] tracking-[0.28em] uppercase">
                                    {t('auth.login.first_visit')}
                                </span>{' '}
                                <TextLink
                                    href={register().url}
                                    tabIndex={5}
                                    className="font-display text-base font-medium"
                                >
                                    {t('auth.login.register_link')}
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </>
    );
}
