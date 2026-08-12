import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { StorefrontPageHeader } from '@/components/storefront/page-header';
import { ProductGrid } from '@/components/storefront/product-grid';
import { ShopFilters } from '@/components/storefront/shop-filters';
import type { ShopFilterState } from '@/components/storefront/shop-filters';
import { StorefrontPagination } from '@/components/storefront/storefront-pagination';
import { home, shop } from '@/routes';
import { show as categoryShow } from '@/routes/categories';
import type { Paginated } from '@/types/admin';
import type { CategoryCard, ProductCard } from '@/types/storefront';

/**
 * One category's page (§7.12).
 *
 * The same grid and the same filters as the shop, minus the category select —
 * the category is the page, not a filter of it.
 */
export default function CategoryPage({
    category,
    products,
    filters,
    priceRange,
    sorts,
}: {
    category: CategoryCard;
    products: Paginated<ProductCard>;
    filters: ShopFilterState;
    priceRange: { min: number; max: number };
    sorts: string[];
}) {
    const { t } = useTranslation(['shop', 'nav']);

    return (
        <>
            <Head title={category.name} />

            <StorefrontPageHeader
                eyebrow={t('shop:category.eyebrow')}
                title={category.name}
                description={category.description ?? undefined}
                crumbs={[
                    { label: t('nav:primary.home'), href: home().url },
                    { label: t('shop:title'), href: shop().url },
                    { label: category.name },
                ]}
            />

            <div className="mx-auto max-w-drio px-5 py-10 md:px-8 md:py-12 lg:px-10">
                <ShopFilters
                    action={categoryShow(category.slug).url}
                    filters={filters}
                    sorts={sorts}
                    priceRange={priceRange}
                    resultCount={products.meta.total}
                />

                <div className="mt-8">
                    <ProductGrid
                        products={products.data}
                        emptyMessage={t('shop:emptyCategory')}
                        columns={4}
                    />
                </div>

                <StorefrontPagination
                    meta={products.meta}
                    links={products.links}
                    className="mt-10"
                />
            </div>
        </>
    );
}
