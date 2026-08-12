import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { ProductForm } from '@/components/admin/product-form';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { destroy, index } from '@/routes/admin/products';
import type {
    CategoryRow,
    ProductForm as ProductFormData,
} from '@/types/admin';

export default function ProductEdit({
    product,
    categories,
}: {
    product: ProductFormData;
    categories: CategoryRow[];
}) {
    const { t } = useTranslation('admin');
    const { defaultLocale } = useLocale();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const name = product.name[defaultLocale] || product.slug;

    return (
        <>
            <Head title={name} />

            <PageHeader
                title={t('products.editTitle')}
                description={name}
                actions={
                    <>
                        <Button size="sm" variant="ghost" asChild>
                            <Link href={index()}>{t('actions.back')}</Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setConfirmOpen(true)}
                        >
                            {t('actions.delete')}
                        </Button>
                    </>
                }
            />

            <ProductForm product={product} categories={categories} />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                name={name}
                onConfirm={() => router.delete(destroy(product.id).url)}
            />
        </>
    );
}
