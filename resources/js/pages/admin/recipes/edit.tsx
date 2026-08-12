import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { RecipeForm } from '@/components/admin/recipe-form';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { destroy, index } from '@/routes/admin/recipes';
import type { ProductRow, RecipeForm as RecipeFormData } from '@/types/admin';

export default function RecipeEdit({
    recipe,
    products,
}: {
    recipe: RecipeFormData;
    products: ProductRow[];
}) {
    const { t } = useTranslation('admin');
    const { defaultLocale } = useLocale();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const name = recipe.title[defaultLocale] || recipe.slug;

    return (
        <>
            <Head title={name} />

            <PageHeader
                title={t('recipes.editTitle')}
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

            <RecipeForm recipe={recipe} products={products} />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                name={name}
                onConfirm={() => router.delete(destroy(recipe.id).url)}
            />
        </>
    );
}
