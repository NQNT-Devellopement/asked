import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store as storeQuestion } from '@/routes/faq/questions';

const BODY_MIN = 5;
const BODY_MAX = 1000;

type Props = {
    teamSlug: string;
    teamName: string;
};

type FormShape = {
    body: string;
    author_name: string;
};

export function QuestionForm({ teamSlug, teamName }: Props) {
    const { t } = useTranslate();
    const { data, setData, post, processing, errors, reset } =
        useForm<FormShape>({
            body: '',
            author_name: '',
        });

    const remaining = BODY_MAX - data.body.length;
    const tooShort =
        data.body.trim().length > 0 && data.body.trim().length < BODY_MIN;
    const tooLong = remaining < 0;
    const counterTone = tooLong
        ? 'text-destructive'
        : remaining < 80
          ? 'text-[var(--accent-ink)]'
          : 'text-muted-foreground';

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(storeQuestion(teamSlug).url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success(t('faq.form.toast_title'), {
                    description: t('faq.form.toast_description', {
                        name: teamName,
                    }),
                });
            },
            onError: (errors) => {
                if (Object.keys(errors).length === 0) {
                    toast.error(t('faq.form.toast_failed'));
                }
            },
        });
    };

    return (
        <form
            id="ask"
            onSubmit={onSubmit}
            noValidate
            className={cn(
                'relative isolate overflow-hidden rounded-3xl border border-border/70',
                'bg-card/85 p-5 shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_60px_-40px_rgba(15,12,8,0.45)]',
                'backdrop-blur-md sm:p-7',
            )}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-[var(--accent-ink)]/15 blur-3xl"
            />

            <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.28em] text-[var(--accent-ink)] uppercase">
                    {t('faq.form.mailroom')}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-border/80" />
            </div>

            <h2 className="font-display mt-3 text-2xl leading-tight text-foreground sm:text-3xl">
                {t('faq.form.title', { name: teamName })}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
                {t('faq.form.description')}
            </p>

            <div className="mt-6 space-y-5">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="faq-body"
                            className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase"
                        >
                            {t('faq.form.body_label')}
                        </Label>
                        <span
                            className={cn(
                                'font-mono text-[10px] tabular-nums',
                                counterTone,
                            )}
                        >
                            {data.body.length}/{BODY_MAX}
                        </span>
                    </div>
                    <textarea
                        id="faq-body"
                        name="body"
                        required
                        minLength={BODY_MIN}
                        maxLength={BODY_MAX + 32}
                        rows={4}
                        value={data.body}
                        onChange={(event) =>
                            setData('body', event.target.value)
                        }
                        placeholder={t('faq.form.body_placeholder')}
                        aria-invalid={Boolean(errors.body)}
                        className={cn(
                            'block w-full resize-y rounded-2xl border border-input bg-background/70 px-4 py-3.5',
                            'font-display text-base leading-relaxed text-foreground placeholder:text-muted-foreground/70',
                            'shadow-xs transition-[border-color,box-shadow,background-color] outline-none',
                            'focus-visible:border-[var(--accent-ink)] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-ink)]/30',
                            'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
                            'min-h-[120px]',
                        )}
                    />
                    <InputError message={errors.body} />
                    {tooShort && !errors.body ? (
                        <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                            {t('faq.form.min_chars', { count: BODY_MIN })}
                        </p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="faq-author"
                        className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase"
                    >
                        {t('faq.form.author_label')}
                    </Label>
                    <Input
                        id="faq-author"
                        name="author_name"
                        type="text"
                        maxLength={80}
                        value={data.author_name}
                        onChange={(event) =>
                            setData('author_name', event.target.value)
                        }
                        placeholder={t('faq.form.author_placeholder')}
                        aria-invalid={Boolean(errors.author_name)}
                        className="h-11 rounded-xl bg-background/70 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:border-[var(--accent-ink)] focus-visible:ring-[var(--accent-ink)]/30"
                    />
                    <InputError message={errors.author_name} />
                </div>

                <div className="flex flex-col-reverse items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        {t('faq.form.review_notice')}
                    </p>
                    <Button
                        type="submit"
                        size="lg"
                        disabled={
                            processing ||
                            tooLong ||
                            data.body.trim().length < BODY_MIN
                        }
                        className={cn(
                            'group/btn h-12 min-h-[44px] rounded-full px-6 text-sm font-medium tracking-wide',
                            'bg-[var(--accent-ink)] text-[var(--accent-foreground)] shadow-sm',
                            'hover:bg-[var(--accent-ink)]/90 hover:shadow-md',
                            'focus-visible:ring-[var(--accent-ink)]/40',
                        )}
                    >
                        {processing ? <Spinner /> : <Send className="size-4" />}
                        {processing
                            ? t('faq.form.sending')
                            : t('faq.form.submit')}
                    </Button>
                </div>
            </div>
        </form>
    );
}
