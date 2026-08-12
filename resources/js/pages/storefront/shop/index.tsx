import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { StorefrontPageHeader } from '@/components/storefront/page-header';
import { ProductGrid } from '@/components/storefront/product-grid';
import { ShopFilters } from '@/components/storefront/shop-filters';
import type { ShopFilterState } from '@/components/storefront/shop-filters';
import { StorefrontPagination } from '@/components/storefront/storefront-pagination';
import { home, shop } from '@/routes';
import type { Paginated } from '@/types/admin';
import type { CategoryCard, ProductCard } from '@/types/storefront';

/**
 * The shop index (§7.12): the full catalogue with category, price and dietary
 * filters, sort and pagination.
 */
export default function ShopIndex({
    products,
    categories,
    filters,
    priceRange,
    sorts,
}: {
    products: Paginated<ProductCard>;
    categories: CategoryCard[];
    filters: ShopFilterState;
    priceRange: { min: number; max: number };
    sorts: string[];
}) {
    const { t } = useTranslation(['shop', 'nav']);

    return (
        <>
            <Head title={t('shop:title')} />

            <StorefrontPageHeader
                eyebrow={t('shop:eyebrow')}
                title={t('shop:title')}
                description={t('shop:description')}
                crumbs={[
                    { label: t('nav:primary.home'), href: home().url },
                    { label: t('shop:title') },
                ]}
            />

            <div className="mx-auto max-w-drio px-5 py-10 md:px-8 md:py-12 lg:px-10">
                <ShopFilters
                    action={shop().url}
                    filters={filters}
                    sorts={sorts}
                    priceRange={priceRange}
                    categories={categories}
                    resultCount={products.meta.total}
                />

                <div className="mt-8">
                    <ProductGrid
                        products={products.data}
                        emptyMessage={t('shop:empty')}
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
