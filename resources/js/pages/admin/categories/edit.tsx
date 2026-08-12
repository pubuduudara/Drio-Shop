import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CategoryForm } from '@/components/admin/category-form';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { destroy, index } from '@/routes/admin/categories';
import type { CategoryForm as CategoryFormData } from '@/types/admin';

export default function CategoryEdit({
    category,
    productsCount,
}: {
    category: CategoryFormData;
    productsCount: number;
}) {
    const { t } = useTranslation('admin');
    const { defaultLocale } = useLocale();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const name = category.name[defaultLocale] || category.slug;
    const hasProducts = productsCount > 0;

    return (
        <>
            <Head title={name} />

            <PageHeader
                title={t('categories.editTitle')}
                description={name}
                actions={
                    <>
                        <Button size="sm" variant="ghost" asChild>
                            <Link href={index()}>{t('actions.back')}</Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            disabled={hasProducts}
                            title={
                                hasProducts
                                    ? t('categories.deleteBlocked')
                                    : undefined
                            }
                            onClick={() => setConfirmOpen(true)}
                        >
                            {t('actions.delete')}
                        </Button>
                    </>
                }
            />

            <CategoryForm category={category} />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                name={name}
                onConfirm={() => router.delete(destroy(category.id).url)}
            />
        </>
    );
}
