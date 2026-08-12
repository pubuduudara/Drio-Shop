import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { t } = useTranslation('account');

    return (
        <>
            <Head title={t('appearance.title')} />

            <h1 className="sr-only">{t('appearance.title')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('appearance.heading')}
                    description={t('appearance.description')}
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
