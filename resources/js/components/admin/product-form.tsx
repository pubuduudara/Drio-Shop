import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AdminInput,
    AdminSelect,
    AdminToggle,
    FormSection,
    FormTabs,
} from '@/components/admin/form';
import { ProductMedia } from '@/components/admin/product-media';
import { TranslatableField } from '@/components/admin/translatable-field';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { index, store, update } from '@/routes/admin/products';
import type {
    CategoryRow,
    ProductForm as ProductFormData,
    Translations,
} from '@/types/admin';

/**
 * The product create/edit form (§8).
 *
 * Tabbed rather than one long column, because the five groups are edited at
 * different times: Details on creation, Pricing and Inventory constantly,
 * Media once the photography arrives.
 *
 * Every translatable field goes through `<TranslatableField />` from day one
 * (§9.5) — today it renders as a plain input, and the day a second locale is
 * enabled it grows tabs with no edit here.
 */

type Payload = {
    name: Translations;
    short_description: Translations;
    description: Translations;
    category_id: string;
    slug: string;
    sku: string;
    price_minor: number;
    compare_at_price_minor: number | null;
    currency: string;
    weight_grams: number | null;
    stock_quantity: number;
    sort_order: number;
    is_active: boolean;
    is_best_seller: boolean;
    is_vegetarian: boolean;
};

type TabKey = 'details' | 'pricing' | 'inventory' | 'media' | 'flags';

/** Which tab owns which field, so a failed save can point at the right one. */
const TAB_FIELDS: Record<TabKey, string[]> = {
    details: [
        'name',
        'slug',
        'category_id',
        'short_description',
        'description',
    ],
    pricing: ['price_minor', 'compare_at_price_minor', 'currency'],
    inventory: ['sku', 'stock_quantity', 'weight_grams', 'sort_order'],
    media: [],
    flags: ['is_active', 'is_best_seller', 'is_vegetarian'],
};

export function ProductForm({
    product,
    categories,
    defaultCurrency = 'JPY',
}: {
    /** Absent when creating. */
    product?: ProductFormData;
    categories: CategoryRow[];
    defaultCurrency?: string;
}) {
    const { t } = useTranslation('admin');
    const { enabledLocales } = useLocale();
    const [tab, setTab] = useState<TabKey>('details');

    const empty = (): Translations =>
        Object.fromEntries(enabledLocales.map((locale) => [locale, '']));

    const form = useForm<Payload>({
        name: product?.name ?? empty(),
        short_description: product?.shortDescription ?? empty(),
        description: product?.description ?? empty(),
        category_id: String(product?.categoryId ?? categories[0]?.id ?? ''),
        slug: product?.slug ?? '',
        sku: product?.sku ?? '',
        price_minor: product?.priceMinor ?? 0,
        compare_at_price_minor: product?.compareAtPriceMinor ?? null,
        currency: product?.currency ?? defaultCurrency,
        weight_grams: product?.weightGrams ?? null,
        stock_quantity: product?.stockQuantity ?? 0,
        sort_order: product?.sortOrder ?? 0,
        is_active: product?.isActive ?? true,
        is_best_seller: product?.isBestSeller ?? false,
        is_vegetarian: product?.isVegetarian ?? true,
    });

    const errors = form.errors as Record<string, string | undefined>;

    const invalidTabs = (Object.keys(TAB_FIELDS) as TabKey[]).filter((key) =>
        TAB_FIELDS[key].some((field) =>
            Object.keys(errors).some(
                (error) => error === field || error.startsWith(`${field}.`),
            ),
        ),
    );

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (product) {
            form.put(update(product.id).url, { preserveScroll: true });
        } else {
            form.post(store().url);
        }
    };

    return (
        <form onSubmit={submit} className="grid max-w-3xl gap-4">
            <FormTabs
                tabs={[
                    { key: 'details', label: t('products.tabs.details') },
                    { key: 'pricing', label: t('products.tabs.pricing') },
                    { key: 'inventory', label: t('products.tabs.inventory') },
                    { key: 'media', label: t('products.tabs.media') },
                    { key: 'flags', label: t('products.tabs.flags') },
                ]}
                active={tab}
                onChange={setTab}
                invalid={invalidTabs}
            />

            {tab === 'details' && (
                <FormSection title={t('products.tabs.details')}>
                    <TranslatableField
                        name="name"
                        label={t('products.fields.name')}
                        value={form.data.name}
                        onChange={(value) => form.setData('name', value)}
                        errors={errors}
                        required
                    />

                    <AdminInput
                        label={t('products.fields.slug')}
                        hint={t('products.fields.slugHint')}
                        value={form.data.slug}
                        error={errors.slug}
                        onChange={(event) =>
                            form.setData('slug', event.target.value)
                        }
                    />

                    <AdminSelect
                        label={t('products.fields.category')}
                        required
                        value={form.data.category_id}
                        error={errors.category_id}
                        options={categories.map((category) => ({
                            value: String(category.id),
                            label: category.name,
                        }))}
                        onChange={(event) =>
                            form.setData('category_id', event.target.value)
                        }
                    />

                    <TranslatableField
                        name="short_description"
                        label={t('products.fields.shortDescription')}
                        as="textarea"
                        rows={2}
                        value={form.data.short_description}
                        onChange={(value) =>
                            form.setData('short_description', value)
                        }
                        errors={errors}
                    />

                    <TranslatableField
                        name="description"
                        label={t('products.fields.description')}
                        as="textarea"
                        rows={6}
                        value={form.data.description}
                        onChange={(value) => form.setData('description', value)}
                        errors={errors}
                    />
                </FormSection>
            )}

            {tab === 'pricing' && (
                <FormSection title={t('products.tabs.pricing')}>
                    <AdminInput
                        type="number"
                        min={0}
                        required
                        label={t('products.fields.price')}
                        hint={t('products.fields.priceHint')}
                        value={form.data.price_minor}
                        error={errors.price_minor}
                        onChange={(event) =>
                            form.setData(
                                'price_minor',
                                Number(event.target.value),
                            )
                        }
                    />

                    <AdminInput
                        type="number"
                        min={0}
                        label={t('products.fields.compareAtPrice')}
                        hint={t('products.fields.compareAtPriceHint')}
                        value={form.data.compare_at_price_minor ?? ''}
                        error={errors.compare_at_price_minor}
                        onChange={(event) =>
                            form.setData(
                                'compare_at_price_minor',
                                event.target.value === ''
                                    ? null
                                    : Number(event.target.value),
                            )
                        }
                    />

                    <AdminInput
                        label={t('products.fields.currency')}
                        maxLength={3}
                        required
                        value={form.data.currency}
                        error={errors.currency}
                        onChange={(event) =>
                            form.setData(
                                'currency',
                                event.target.value.toUpperCase(),
                            )
                        }
                    />
                </FormSection>
            )}

            {tab === 'inventory' && (
                <FormSection title={t('products.tabs.inventory')}>
                    <AdminInput
                        label={t('products.fields.sku')}
                        required
                        value={form.data.sku}
                        error={errors.sku}
                        onChange={(event) =>
                            form.setData('sku', event.target.value)
                        }
                    />

                    <AdminInput
                        type="number"
                        min={0}
                        required
                        label={t('products.fields.stock')}
                        value={form.data.stock_quantity}
                        error={errors.stock_quantity}
                        onChange={(event) =>
                            form.setData(
                                'stock_quantity',
                                Number(event.target.value),
                            )
                        }
                    />

                    <AdminInput
                        type="number"
                        min={0}
                        label={t('products.fields.weight')}
                        value={form.data.weight_grams ?? ''}
                        error={errors.weight_grams}
                        onChange={(event) =>
                            form.setData(
                                'weight_grams',
                                event.target.value === ''
                                    ? null
                                    : Number(event.target.value),
                            )
                        }
                    />

                    <AdminInput
                        type="number"
                        min={0}
                        label={t('products.fields.sortOrder')}
                        value={form.data.sort_order}
                        error={errors.sort_order}
                        onChange={(event) =>
                            form.setData(
                                'sort_order',
                                Number(event.target.value),
                            )
                        }
                    />
                </FormSection>
            )}

            {tab === 'media' && (
                <FormSection
                    title={t('products.media.title')}
                    description={
                        product
                            ? undefined
                            : t('products.media.saveOnlyOnExisting')
                    }
                >
                    {product ? (
                        <ProductMedia
                            productId={product.id}
                            gallery={product.gallery}
                            primaryMediaId={product.primaryMediaId}
                        />
                    ) : null}
                </FormSection>
            )}

            {tab === 'flags' && (
                <FormSection title={t('products.tabs.flags')}>
                    <AdminToggle
                        label={t('products.fields.isActive')}
                        description={t('products.fields.isActiveHint')}
                        checked={form.data.is_active}
                        onChange={(checked) =>
                            form.setData('is_active', checked)
                        }
                    />
                    <AdminToggle
                        label={t('products.fields.isBestSeller')}
                        description={t('products.fields.isBestSellerHint')}
                        checked={form.data.is_best_seller}
                        onChange={(checked) =>
                            form.setData('is_best_seller', checked)
                        }
                    />
                    <AdminToggle
                        label={t('products.fields.isVegetarian')}
                        checked={form.data.is_vegetarian}
                        onChange={(checked) =>
                            form.setData('is_vegetarian', checked)
                        }
                    />
                </FormSection>
            )}

            <div className="flex items-center gap-2">
                <Button type="submit" size="sm" disabled={form.processing}>
                    {t('actions.save')}
                </Button>
                <Button type="button" size="sm" variant="ghost" asChild>
                    <Link href={index()}>{t('actions.cancel')}</Link>
                </Button>
            </div>
        </form>
    );
}
