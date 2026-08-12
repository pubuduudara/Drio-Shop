import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { CategoryForm } from '@/components/admin/category-form';
import { PageHeader } from '@/components/admin/page-header';

export default function CategoryCreate({
    nextSortOrder,
}: {
    nextSortOrder: number;
}) {
    const { t } = useTranslation('admin');

    return (
        <>
            <Head title={t('categories.createTitle')} />

            <PageHeader title={t('categories.createTitle')} />

            <CategoryForm nextSortOrder={nextSortOrder} />
        </>
    );
}
