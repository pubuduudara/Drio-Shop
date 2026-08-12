import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/drio/button';
import { Select } from '@/components/drio/field';
import { formatPrice } from '@/components/drio/price';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import type { CategoryCard } from '@/types/storefront';

/**
 * The shop's category, price and dietary filters plus its sort (§7.12).
 *
 * Every change is a visit rather than local state, so the filtered view lives
 * in the URL: shareable, bookmarkable, and restored by the back button.
 * `preserveScroll` keeps the customer where they were in the grid.
 */

export type ShopFilterState = {
    q: string | null;
    category: string | null;
    min: number | null;
    max: number | null;
    dietary: string | null;
    sort: string;
};

export function ShopFilters({
    action,
    filters,
    sorts,
    priceRange,
    categories,
    resultCount,
}: {
    /** Where a changed filter navigates — the shop, or one category's page. */
    action: string;
    filters: ShopFilterState;
    sorts: string[];
    priceRange: { min: number; max: number };
    /** Omitted on a category page, where the category is already decided. */
    categories?: CategoryCard[];
    resultCount: number;
}) {
    const { t } = useTranslation(['shop', 'common']);
    const { locale } = useLocale();

    const apply = (changes: Partial<ShopFilterState>): void => {
        const next = { ...filters, ...changes };

        router.get(
            action,
            {
                q: next.q ?? undefined,
                // A category page owns its category; it never travels as a query.
                category: categories ? (next.category ?? undefined) : undefined,
                min: next.min ?? undefined,
                max: next.max ?? undefined,
                dietary: next.dietary ?? undefined,
                sort: next.sort === 'featured' ? undefined : next.sort,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const hasFilters =
        filters.q !== null ||
        (categories !== undefined && filters.category !== null) ||
        filters.min !== null ||
        filters.max !== null ||
        filters.dietary !== null ||
        filters.sort !== 'featured';

    /** Three bands derived from the catalogue, not from invented round numbers. */
    const bands = priceBands(priceRange);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
                {categories && (
                    <Select
                        label={t('shop:filters.category')}
                        className="min-w-48"
                        value={filters.category ?? ''}
                        placeholder={t('shop:filters.allCategories')}
                        options={categories.map((category) => ({
                            value: category.slug,
                            label: category.name,
                        }))}
                        onChange={(event) =>
                            apply({ category: event.target.value || null })
                        }
                    />
                )}

                <Select
                    label={t('shop:filters.price')}
                    className="min-w-48"
                    value={activeBand(filters, bands)}
                    placeholder={t('shop:filters.anyPrice')}
                    options={bands.map((band, index) => ({
                        value: String(index),
                        label: bandLabel(band, locale, t),
                    }))}
                    onChange={(event) => {
                        const band = bands[Number(event.target.value)];

                        apply({
                            min: band?.min ?? null,
                            max: band?.max ?? null,
                        });
                    }}
                />

                <Select
                    label={t('shop:filters.dietary')}
                    className="min-w-44"
                    value={filters.dietary ?? ''}
                    placeholder={t('shop:filters.anyDiet')}
                    options={[
                        {
                            value: 'vegetarian',
                            label: t('common:badge.vegetarian'),
                        },
                    ]}
                    onChange={(event) =>
                        apply({ dietary: event.target.value || null })
                    }
                />

                <Select
                    label={t('shop:sort.label')}
                    className="min-w-48"
                    value={filters.sort}
                    options={sorts.map((sort) => ({
                        value: sort,
                        label: t(`shop:sort.${sort}`),
                    }))}
                    onChange={(event) => apply({ sort: event.target.value })}
                />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-small text-ink-muted" aria-live="polite">
                    {filters.q
                        ? t('shop:resultsFor', {
                              count: resultCount,
                              term: filters.q,
                          })
                        : t('shop:results', { count: resultCount })}
                </p>

                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            router.get(action, {}, { preserveScroll: true })
                        }
                        className={cn('px-0')}
                    >
                        {t('shop:filters.clear')}
                    </Button>
                )}
            </div>
        </div>
    );
}

type PriceBand = { min: number | null; max: number | null };

/**
 * Splits the catalogue's own price range into thirds. Hardcoded bands go stale
 * the moment the client adds a gift set, and a band with nothing in it is a
 * filter that only ever returns an empty state.
 */
function priceBands({ min, max }: { min: number; max: number }): PriceBand[] {
    if (max <= min) {
        return [];
    }

    const step = Math.round((max - min) / 3);

    return [
        { min: null, max: min + step },
        { min: min + step, max: min + step * 2 },
        { min: min + step * 2, max: null },
    ];
}

function activeBand(filters: ShopFilterState, bands: PriceBand[]): string {
    const index = bands.findIndex(
        (band) => band.min === filters.min && band.max === filters.max,
    );

    return index === -1 ? '' : String(index);
}

function bandLabel(
    band: PriceBand,
    locale: string,
    t: (key: string, options?: Record<string, unknown>) => string,
): string {
    if (band.min === null && band.max !== null) {
        return t('shop:filters.under', {
            amount: formatPrice(band.max, 'JPY', locale),
        });
    }

    if (band.max === null && band.min !== null) {
        return t('shop:filters.over', {
            amount: formatPrice(band.min, 'JPY', locale),
        });
    }

    return t('shop:filters.between', {
        from: formatPrice(band.min ?? 0, 'JPY', locale),
        to: formatPrice(band.max ?? 0, 'JPY', locale),
    });
}
