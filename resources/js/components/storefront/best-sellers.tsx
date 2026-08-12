import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '@/components/drio/section-header';
import { shop } from '@/routes';
import type { ProductCard as ProductCardData } from '@/types/storefront';
import { ProductCard } from './product-card';
import { QuickViewModal } from './quick-view-modal';

/**
 * Best Sellers (§7.4). Five cards on desktop, three on tablet, two on mobile.
 */
export function BestSellers({ products }: { products: ProductCardData[] }) {
    const { t } = useTranslation(['home', 'common']);
    const [quickViewProduct, setQuickViewProduct] =
        useState<ProductCardData | null>(null);

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="bg-band">
            <div className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
                <SectionHeader
                    title={t('home:bestSellers.title')}
                    viewAllHref={shop()}
                    viewAllLabel={t('common:viewAll.products')}
                />

                <ul className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
                    {products.map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            onQuickView={setQuickViewProduct}
                        />
                    ))}
                </ul>
            </div>

            {/* Keyed so each product opens with a fresh quantity stepper. */}
            <QuickViewModal
                key={quickViewProduct?.id ?? 'closed'}
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </section>
    );
}
