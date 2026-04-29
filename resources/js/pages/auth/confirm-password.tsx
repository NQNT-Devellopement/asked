import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { ArrowUpRight, Lock } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslate } from '@/lib/i18n';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const { t } = useTranslate();

    setLayoutProps({
        title: t('auth.confirm_password.page_title'),
        description: t('auth.confirm_password.page_description'),
    });

    return (
        <>
            <Head title={t('auth.confirm_password.head_title')} />

            <div className="mb-7 flex items-start gap-4">
                <span
                    aria-hidden="true"
                    className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[var(--accent-ink)]/35 bg-[var(--accent-ink)]/10 text-[var(--accent-ink)]"
                >
                    <Lock className="size-5" />
                </span>
                <p className="font-display text-base leading-relaxed text-foreground/80">
                    {t('auth.confirm_password.lede')}
                </p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-7"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                {t('auth.confirm_password.password_label')}
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder={t(
                                    'auth.confirm_password.password_placeholder',
                                )}
                                autoComplete="current-password"
                                autoFocus
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && <Spinner />}
                            {t('auth.confirm_password.submit')}
                            <ArrowUpRight className="size-4" />
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}
