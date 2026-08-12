import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { HeroSlideForm } from '@/components/admin/hero-slide-form';
import { PageHeader } from '@/components/admin/page-header';

export default function HeroSlideCreate({
    nextSortOrder,
}: {
    nextSortOrder: number;
}) {
    const { t } = useTranslation('admin');

    return (
        <>
            <Head title={t('heroSlides.createTitle')} />
            <PageHeader title={t('heroSlides.createTitle')} />
            <HeroSlideForm nextSortOrder={nextSortOrder} />
        </>
    );
}
