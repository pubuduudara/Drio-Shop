import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AdminInput,
    AdminToggle,
    FormSection,
    FormTabs,
} from '@/components/admin/form';
import { TranslatableField } from '@/components/admin/translatable-field';
import { TranslatableListField } from '@/components/admin/translatable-list-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { index, store, update } from '@/routes/admin/recipes';
import type {
    ProductRow,
    RecipeForm as RecipeFormData,
    TranslatedList,
    Translations,
} from '@/types/admin';

/**
 * The recipe create/edit form (§8): a repeatable ingredients and method
 * builder, plus the product links that drive "shop the ingredients" (§7.12).
 */

type Payload = {
    title: Translations;
    intro: Translations;
    ingredients: TranslatedList;
    steps: TranslatedList;
    slug: string;
    prep_minutes: number | null;
    cook_minutes: number | null;
    serves: number | null;
    sort_order: number;
    is_vegetarian: boolean;
    is_traditional: boolean;
    is_quick: boolean;
    is_published: boolean;
    product_ids: number[];
};

type TabKey = 'details' | 'method' | 'products' | 'flags';

const TAB_FIELDS: Record<TabKey, string[]> = {
    details: [
        'title',
        'slug',
        'intro',
        'prep_minutes',
        'cook_minutes',
        'serves',
    ],
    method: ['ingredients', 'steps'],
    products: ['product_ids'],
    flags: ['is_published', 'is_vegetarian', 'is_traditional', 'is_quick'],
};

export function RecipeForm({
    recipe,
    products,
    nextSortOrder = 0,
}: {
    recipe?: RecipeFormData;
    products: ProductRow[];
    nextSortOrder?: number;
}) {
    const { t } = useTranslation('admin');
    const { enabledLocales } = useLocale();
    const [tab, setTab] = useState<TabKey>('details');
    const [productSearch, setProductSearch] = useState('');

    const emptyText = (): Translations =>
        Object.fromEntries(enabledLocales.map((locale) => [locale, '']));

    const emptyList = (): TranslatedList =>
        Object.fromEntries(enabledLocales.map((locale) => [locale, ['']]));

    const form = useForm<Payload>({
        title: recipe?.title ?? emptyText(),
        intro: recipe?.intro ?? emptyText(),
        ingredients: recipe?.ingredients ?? emptyList(),
        steps: recipe?.steps ?? emptyList(),
        slug: recipe?.slug ?? '',
        prep_minutes: recipe?.prepMinutes ?? null,
        cook_minutes: recipe?.cookMinutes ?? null,
        serves: recipe?.serves ?? null,
        sort_order: recipe?.sortOrder ?? nextSortOrder,
        is_vegetarian: recipe?.isVegetarian ?? true,
        is_traditional: recipe?.isTraditional ?? false,
        is_quick: recipe?.isQuick ?? false,
        is_published: recipe?.isPublished ?? false,
        product_ids: recipe?.productIds ?? [],
    });

    const errors = form.errors as Record<string, string | undefined>;

    const invalidTabs = (Object.keys(TAB_FIELDS) as TabKey[]).filter((key) =>
        TAB_FIELDS[key].some((field) =>
            Object.keys(errors).some(
                (error) => error === field || error.startsWith(`${field}.`),
            ),
        ),
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (recipe) {
            form.put(update(recipe.id).url, { preserveScroll: true });
        } else {
            form.post(store().url);
        }
    };

    const visibleProducts = products.filter((product) =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()),
    );

    return (
        <form onSubmit={submit} className="grid max-w-3xl gap-4">
            <FormTabs
                tabs={[
                    { key: 'details', label: t('recipes.tabs.details') },
                    { key: 'method', label: t('recipes.tabs.method') },
                    { key: 'products', label: t('recipes.tabs.products') },
                    { key: 'flags', label: t('recipes.tabs.flags') },
                ]}
                active={tab}
                onChange={setTab}
                invalid={invalidTabs}
            />

            {tab === 'details' && (
                <FormSection title={t('recipes.tabs.details')}>
                    <TranslatableField
                        name="title"
                        label={t('recipes.fields.title')}
                        value={form.data.title}
                        onChange={(value) => form.setData('title', value)}
                        errors={errors}
                        required
                    />

                    <AdminInput
                        label={t('recipes.fields.slug')}
                        hint={t('recipes.fields.slugHint')}
                        value={form.data.slug}
                        error={errors.slug}
                        onChange={(event) =>
                            form.setData('slug', event.target.value)
                        }
                    />

                    <TranslatableField
                        name="intro"
                        label={t('recipes.fields.intro')}
                        as="textarea"
                        rows={3}
                        value={form.data.intro}
                        onChange={(value) => form.setData('intro', value)}
                        errors={errors}
                    />

                    <div className="grid gap-3 sm:grid-cols-3">
                        <AdminInput
                            type="number"
                            min={0}
                            label={t('recipes.fields.prepMinutes')}
                            value={form.data.prep_minutes ?? ''}
                            error={errors.prep_minutes}
                            onChange={(event) =>
                                form.setData(
                                    'prep_minutes',
                                    event.target.value === ''
                                        ? null
                                        : Number(event.target.value),
                                )
                            }
                        />
                        <AdminInput
                            type="number"
                            min={0}
                            label={t('recipes.fields.cookMinutes')}
                            value={form.data.cook_minutes ?? ''}
                            error={errors.cook_minutes}
                            onChange={(event) =>
                                form.setData(
                                    'cook_minutes',
                                    event.target.value === ''
                                        ? null
                                        : Number(event.target.value),
                                )
                            }
                        />
                        <AdminInput
                            type="number"
                            min={1}
                            label={t('recipes.fields.serves')}
                            value={form.data.serves ?? ''}
                            error={errors.serves}
                            onChange={(event) =>
                                form.setData(
                                    'serves',
                                    event.target.value === ''
                                        ? null
                                        : Number(event.target.value),
                                )
                            }
                        />
                    </div>
                </FormSection>
            )}

            {tab === 'method' && (
                <FormSection title={t('recipes.tabs.method')}>
                    <TranslatableListField
                        name="ingredients"
                        label={t('recipes.fields.ingredients')}
                        addLabel={t('recipes.fields.addIngredient')}
                        placeholder={t('recipes.fields.ingredientPlaceholder')}
                        value={form.data.ingredients}
                        onChange={(value) => form.setData('ingredients', value)}
                        errors={errors}
                        required
                    />

                    <TranslatableListField
                        name="steps"
                        label={t('recipes.fields.steps')}
                        addLabel={t('recipes.fields.addStep')}
                        placeholder={t('recipes.fields.stepPlaceholder')}
                        value={form.data.steps}
                        onChange={(value) => form.setData('steps', value)}
                        errors={errors}
                        numbered
                        required
                    />
                </FormSection>
            )}

            {tab === 'products' && (
                <FormSection
                    title={t('recipes.tabs.products')}
                    description={t('recipes.fields.productsHint')}
                >
                    <Input
                        type="search"
                        value={productSearch}
                        placeholder={t('recipes.fields.productSearch')}
                        aria-label={t('recipes.fields.productSearch')}
                        onChange={(event) =>
                            setProductSearch(event.target.value)
                        }
                        className="h-8 text-[13px]"
                    />

                    <ul className="max-h-80 overflow-y-auto rounded-md border border-neutral-200">
                        {visibleProducts.length === 0 && (
                            <li className="px-3 py-6 text-center text-neutral-500">
                                {t('recipes.fields.noProducts')}
                            </li>
                        )}

                        {visibleProducts.map((product) => {
                            const isLinked = form.data.product_ids.includes(
                                product.id,
                            );

                            return (
                                <li
                                    key={product.id}
                                    className={cn(
                                        'border-b border-neutral-100 last:border-b-0',
                                        isLinked && 'bg-neutral-50',
                                    )}
                                >
                                    <label className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5">
                                        <input
                                            type="checkbox"
                                            checked={isLinked}
                                            onChange={(event) =>
                                                form.setData(
                                                    'product_ids',
                                                    event.target.checked
                                                        ? [
                                                              ...form.data
                                                                  .product_ids,
                                                              product.id,
                                                          ]
                                                        : form.data.product_ids.filter(
                                                              (id) =>
                                                                  id !==
                                                                  product.id,
                                                          ),
                                                )
                                            }
                                            className="size-3.5 accent-neutral-900"
                                        />
                                        <span className="flex-1">
                                            {product.name}
                                        </span>
                                        <span className="font-mono text-[11px] text-neutral-500">
                                            {product.sku}
                                        </span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </FormSection>
            )}

            {tab === 'flags' && (
                <FormSection title={t('recipes.tabs.flags')}>
                    <AdminToggle
                        label={t('recipes.fields.isPublished')}
                        description={t('recipes.fields.isPublishedHint')}
                        checked={form.data.is_published}
                        onChange={(checked) =>
                            form.setData('is_published', checked)
                        }
                    />
                    <AdminToggle
                        label={t('recipes.fields.isVegetarian')}
                        checked={form.data.is_vegetarian}
                        onChange={(checked) =>
                            form.setData('is_vegetarian', checked)
                        }
                    />
                    <AdminToggle
                        label={t('recipes.fields.isTraditional')}
                        checked={form.data.is_traditional}
                        onChange={(checked) =>
                            form.setData('is_traditional', checked)
                        }
                    />
                    <AdminToggle
                        label={t('recipes.fields.isQuick')}
                        checked={form.data.is_quick}
                        onChange={(checked) =>
                            form.setData('is_quick', checked)
                        }
                    />

                    <AdminInput
                        type="number"
                        min={0}
                        label={t('recipes.fields.sortOrder')}
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
