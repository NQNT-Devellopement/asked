import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslate } from '@/lib/i18n';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const { t } = useTranslate();

    setLayoutProps({
        title: t('auth.register.page_title'),
        description: t('auth.register.page_description'),
    });

    return (
        <>
            <Head title={t('auth.register.head_title')} />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-7"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-7">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {t('auth.register.name_label')}
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder={t(
                                        'auth.register.name_placeholder',
                                    )}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('auth.register.email_label')}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder={t(
                                        'auth.register.email_placeholder',
                                    )}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {t('auth.register.password_label')}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder={t(
                                        'auth.register.password_placeholder',
                                    )}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {t(
                                        'auth.register.password_confirmation_label',
                                    )}
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder={t(
                                        'auth.register.password_confirmation_placeholder',
                                    )}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                disabled={processing}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                {t('auth.register.submit')}
                                <ArrowUpRight className="size-4" />
                            </Button>
                        </div>

                        <div className="border-t border-dashed border-foreground/15 pt-6 text-center text-sm text-muted-foreground">
                            <span className="font-mono text-[10px] tracking-[0.28em] uppercase">
                                {t('auth.register.already_member')}
                            </span>{' '}
                            <TextLink
                                href={login().url}
                                tabIndex={6}
                                className="font-display text-base font-medium"
                            >
                                {t('auth.register.login_link')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}
