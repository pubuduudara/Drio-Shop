import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/admin/page-header';
import { RecipeForm } from '@/components/admin/recipe-form';
import type { ProductRow } from '@/types/admin';

export default function RecipeCreate({
    products,
    nextSortOrder,
}: {
    products: ProductRow[];
    nextSortOrder: number;
}) {
    const { t } = useTranslation('admin');

    return (
        <>
            <Head title={t('recipes.createTitle')} />
            <PageHeader title={t('recipes.createTitle')} />
            <RecipeForm products={products} nextSortOrder={nextSortOrder} />
        </>
    );
}
