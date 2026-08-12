import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/admin/page-header';
import { ProductForm } from '@/components/admin/product-form';
import type { CategoryRow } from '@/types/admin';

export default function ProductCreate({
    categories,
    defaultCurrency,
}: {
    categories: CategoryRow[];
    defaultCurrency: string;
}) {
    const { t } = useTranslation('admin');

    return (
        <>
            <Head title={t('products.createTitle')} />

            <PageHeader title={t('products.createTitle')} />

            <ProductForm
                categories={categories}
                defaultCurrency={defaultCurrency}
            />
        </>
    );
}
