import { Head, usePage } from '@inertiajs/react';
import {
    EditorialGrain,
    EditorialStyleVariables,
} from '@/components/editorial-chrome';
import { ClosingCta } from '@/components/marketing/closing-cta';
import { ForWhom } from '@/components/marketing/for-whom';
import { HeroSection } from '@/components/marketing/hero-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { useTranslate } from '@/lib/i18n';
import { dashboard } from '@/routes';

type WelcomeProps = {
    canRegister?: boolean;
};

export default function Welcome({ canRegister = true }: WelcomeProps) {
    const { t } = useTranslate();
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug).url : '/';
    const isAuthed = Boolean(auth?.user);

    return (
        <>
            <Head title={t('marketing.meta.home_title')}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:400,500,600,700|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content={t('marketing.meta.description')}
                />
            </Head>

            <div className="editorial-root relative min-h-screen overflow-x-hidden bg-[var(--page-bg)] text-foreground antialiased">
                <EditorialStyleVariables />
                <EditorialGrain withGlow />

                <div className="relative z-10">
                    <SiteHeader
                        canRegister={canRegister}
                        isAuthed={isAuthed}
                        dashboardUrl={dashboardUrl}
                    />
                    <main>
                        <HeroSection canRegister={canRegister} />
                        <HowItWorks />
                        <ForWhom />
                        <ClosingCta canRegister={canRegister} />
                    </main>
                    <SiteFooter />
                </div>
            </div>
        </>
    );
}
