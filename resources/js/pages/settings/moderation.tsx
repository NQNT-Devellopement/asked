import { Head, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslate } from '@/lib/i18n';
import { update as updateModeration } from '@/routes/teams/moderation';

type Props = {
    team: { id: number; name: string; slug: string };
    bannedWords: string[];
};

type FormShape = { words: string[] };

export default function ModerationSettings({ team, bannedWords }: Props) {
    const { t } = useTranslate();
    const { data, setData, put, processing, errors } = useForm<FormShape>({
        words: bannedWords,
    });
    const [draft, setDraft] = useState('');

    const addWord = () => {
        const candidate = draft.trim().toLowerCase();

        if (candidate.length < 2 || data.words.includes(candidate)) {
            setDraft('');

            return;
        }

        setData('words', [...data.words, candidate]);
        setDraft('');
    };

    const removeWord = (word: string) => {
        setData(
            'words',
            data.words.filter((w) => w !== word),
        );
    };

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(updateModeration(team.slug).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('settings.moderation.page_title')} />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('settings.moderation.section_title')}
                    description={t('settings.moderation.section_description')}
                />

                <p className="text-sm text-muted-foreground">
                    {t('settings.moderation.global_notice')}
                </p>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="moderation-new">
                            {t('settings.moderation.add_label')}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="moderation-new"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addWord();
                                    }
                                }}
                                placeholder={t(
                                    'settings.moderation.add_placeholder',
                                )}
                                maxLength={50}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addWord}
                            >
                                {t('settings.moderation.add_button')}
                            </Button>
                        </div>
                        <InputError message={errors['words.0']} />
                        <InputError message={errors.words} />
                    </div>

                    <ul className="space-y-1">
                        {data.words.length === 0 ? (
                            <li className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                                {t('settings.moderation.empty')}
                            </li>
                        ) : (
                            data.words.map((word) => (
                                <li
                                    key={word}
                                    className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
                                >
                                    <span className="font-mono text-sm">
                                        {word}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeWord(word)}
                                        aria-label={t(
                                            'settings.moderation.remove_aria',
                                            { word },
                                        )}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </li>
                            ))
                        )}
                    </ul>

                    <Button type="submit" disabled={processing}>
                        {t('settings.moderation.save')}
                    </Button>
                </form>
            </div>
        </>
    );
}
