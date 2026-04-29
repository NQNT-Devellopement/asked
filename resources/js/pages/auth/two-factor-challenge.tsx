import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { ArrowUpRight, Shield } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { useTranslate } from '@/lib/i18n';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const { t } = useTranslate();
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent: {
        title: string;
        description: string;
        toggleText: string;
    } = showRecoveryInput
        ? {
              title: t('auth.two_factor.recovery.title'),
              description: t('auth.two_factor.recovery.description'),
              toggleText: t('auth.two_factor.recovery.toggle'),
          }
        : {
              title: t('auth.two_factor.standard.title'),
              description: t('auth.two_factor.standard.description'),
              toggleText: t('auth.two_factor.standard.toggle'),
          };

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title={t('auth.two_factor.head_title')} />

            <div className="flex flex-col gap-7">
                <div className="flex items-start gap-3 rounded-md border border-foreground/12 bg-background/50 px-4 py-3">
                    <Shield
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-[var(--accent-ink)]"
                    />
                    <p className="font-mono text-[10px] tracking-[0.28em] text-foreground/70 uppercase">
                        {t('auth.two_factor.press_credentials')}
                    </p>
                </div>

                <Form
                    {...store.form()}
                    className="flex flex-col gap-6"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <div className="grid gap-2">
                                    <Input
                                        name="recovery_code"
                                        type="text"
                                        placeholder={t(
                                            'auth.two_factor.recovery_placeholder',
                                        )}
                                        autoFocus={showRecoveryInput}
                                        required
                                    />
                                    <InputError
                                        message={errors.recovery_code}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <div className="flex w-full items-center justify-center">
                                        <InputOTP
                                            name="code"
                                            maxLength={OTP_MAX_LENGTH}
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={processing}
                                            pattern={REGEXP_ONLY_DIGITS}
                                        >
                                            <InputOTPGroup>
                                                {Array.from(
                                                    { length: OTP_MAX_LENGTH },
                                                    (_, index) => (
                                                        <InputOTPSlot
                                                            key={index}
                                                            index={index}
                                                        />
                                                    ),
                                                )}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <InputError message={errors.code} />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {t('auth.two_factor.submit')}
                                <ArrowUpRight className="size-4" />
                            </Button>

                            <div className="border-t border-dashed border-foreground/15 pt-6 text-center">
                                <button
                                    type="button"
                                    className="font-mono text-[10px] tracking-[0.28em] text-foreground/65 uppercase transition-colors hover:text-foreground"
                                    onClick={() =>
                                        toggleRecoveryMode(clearErrors)
                                    }
                                >
                                    {t('auth.two_factor.or_prefix', {
                                        toggle: authConfigContent.toggleText,
                                    })}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
