import { Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { AdminInput, AdminToggle, FormSection } from '@/components/admin/form';
import { TranslatableField } from '@/components/admin/translatable-field';
import { CategoryIcon } from '@/components/drio/icons/category';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { index, store, update } from '@/routes/admin/categories';
import type {
    CategoryForm as CategoryFormData,
    Translations,
} from '@/types/admin';

/**
 * The category create/edit form (§8).
 *
 * The icon picker offers the drawn SVG set rather than a free text field —
 * a key with no component behind it would render an empty badge on the
 * homepage, so the choice is constrained to what exists (§3).
 */

const ICON_KEYS = ['leaf', 'powder', 'chilli', 'spice'] as const;

type Payload = {
    name: Translations;
    description: Translations;
    slug: string;
    icon_key: string;
    is_featured: boolean;
    sort_order: number;
};

export function CategoryForm({
    category,
    nextSortOrder = 0,
}: {
    category?: CategoryFormData;
    nextSortOrder?: number;
}) {
    const { t } = useTranslation('admin');
    const { enabledLocales } = useLocale();

    const empty = (): Translations =>
        Object.fromEntries(enabledLocales.map((locale) => [locale, '']));

    const form = useForm<Payload>({
        name: category?.name ?? empty(),
        description: category?.description ?? empty(),
        slug: category?.slug ?? '',
        icon_key: category?.iconKey ?? 'leaf',
        is_featured: category?.isFeatured ?? false,
        sort_order: category?.sortOrder ?? nextSortOrder,
    });

    const errors = form.errors as Record<string, string | undefined>;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (category) {
            form.put(update(category.id).url, { preserveScroll: true });
        } else {
            form.post(store().url);
        }
    };

    return (
        <form onSubmit={submit} className="grid max-w-2xl gap-4">
            <FormSection title={t('categories.title')}>
                <TranslatableField
                    name="name"
                    label={t('categories.fields.name')}
                    value={form.data.name}
                    onChange={(value) => form.setData('name', value)}
                    errors={errors}
                    required
                />

                <AdminInput
                    label={t('categories.fields.slug')}
                    hint={t('categories.fields.slugHint')}
                    value={form.data.slug}
                    error={errors.slug}
                    onChange={(event) =>
                        form.setData('slug', event.target.value)
                    }
                />

                <TranslatableField
                    name="description"
                    label={t('categories.fields.description')}
                    as="textarea"
                    rows={3}
                    value={form.data.description}
                    onChange={(value) => form.setData('description', value)}
                    errors={errors}
                />

                <fieldset className="grid gap-1.5">
                    <legend className="text-[13px] font-medium">
                        {t('categories.fields.icon')}
                    </legend>

                    <div className="flex flex-wrap gap-2">
                        {ICON_KEYS.map((key) => {
                            const isActive = form.data.icon_key === key;

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() =>
                                        form.setData('icon_key', key)
                                    }
                                    className={cn(
                                        'flex w-20 flex-col items-center gap-1 rounded-md border px-2 py-2 transition-colors',
                                        isActive
                                            ? 'border-neutral-900 bg-neutral-50'
                                            : 'border-neutral-200 hover:bg-neutral-50',
                                    )}
                                >
                                    <CategoryIcon
                                        iconKey={key}
                                        width={20}
                                        height={20}
                                        className="text-forest"
                                    />
                                    <span className="text-[11px]">
                                        {t(`categories.icons.${key}`)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <p className="text-[11px] text-neutral-500">
                        {t('categories.fields.iconHint')}
                    </p>
                </fieldset>

                <AdminToggle
                    label={t('categories.fields.isFeatured')}
                    description={t('categories.fields.isFeaturedHint')}
                    checked={form.data.is_featured}
                    onChange={(checked) => form.setData('is_featured', checked)}
                />

                <AdminInput
                    type="number"
                    min={0}
                    label={t('categories.fields.sortOrder')}
                    value={form.data.sort_order}
                    error={errors.sort_order}
                    onChange={(event) =>
                        form.setData('sort_order', Number(event.target.value))
                    }
                />
            </FormSection>

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
