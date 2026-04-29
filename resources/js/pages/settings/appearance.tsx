import { Head, setLayoutProps } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { useTranslate } from '@/lib/i18n';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { t } = useTranslate();

    setLayoutProps({
        breadcrumbs: [
            {
                title: t('settings.appearance.breadcrumb'),
                href: editAppearance(),
            },
        ],
    });

    return (
        <>
            <Head title={t('settings.appearance.page_title')} />

            <h1 className="sr-only">{t('settings.appearance.page_title')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('settings.appearance.section_title')}
                    description={t('settings.appearance.section_description')}
                />
                <AppearanceTabs />
            </div>
        </>
    );
}
