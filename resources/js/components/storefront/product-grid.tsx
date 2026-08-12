import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProductCard as ProductCardData } from '@/types/storefront';
import { ProductCard } from './product-card';
import { QuickViewModal } from './quick-view-modal';

/**
 * The catalogue grid shared by the shop, a category page and anywhere else a
 * run of products appears (§7.12).
 *
 * Owns the Quick View modal so every grid gets the same behaviour without each
 * page wiring it up — and so only one modal exists at a time.
 */
export function ProductGrid({
    products,
    emptyMessage,
    columns = 3,
}: {
    products: ProductCardData[];
    emptyMessage: string;
    columns?: 3 | 4;
}) {
    const { t } = useTranslation('common');
    const [quickViewProduct, setQuickViewProduct] =
        useState<ProductCardData | null>(null);

    if (products.length === 0) {
        return (
            <p className="rounded-card border border-hairline bg-surface px-6 py-12 text-center text-copy text-ink-muted">
                {emptyMessage || t('states.empty')}
            </p>
        );
    }

    return (
        <>
            <ul
                className={
                    columns === 4
                        ? 'grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4'
                        : 'grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-3'
                }
            >
                {products.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                        onQuickView={setQuickViewProduct}
                    />
                ))}
            </ul>

            {/* Keyed so each product opens with a fresh quantity stepper. */}
            <QuickViewModal
                key={quickViewProduct?.id ?? 'closed'}
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </>
    );
}
