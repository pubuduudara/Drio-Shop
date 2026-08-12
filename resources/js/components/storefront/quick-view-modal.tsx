import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/drio/badge';
import { Button } from '@/components/drio/button';
import { IconButton } from '@/components/drio/icon-button';
import {
    BagIcon,
    CloseIcon,
    MinusIcon,
    PlusIcon,
} from '@/components/drio/icons/ui';
import { Media } from '@/components/drio/media';
import { Price } from '@/components/drio/price';
import { Rating } from '@/components/drio/rating';
import { useCart } from '@/hooks/use-cart';
import type { ProductCard } from '@/types/storefront';

/**
 * Quick View (§7.4): a larger image, the description, a quantity stepper and
 * add-to-cart.
 *
 * Focus moves into the dialog on open and returns to whatever opened it on
 * close, and Escape dismisses — the minimum for a modal that is usable without
 * a pointer (§11).
 *
 * The caller keys this component on the product id, so opening a different
 * product remounts it and the quantity starts at 1 again. Resetting by remount
 * rather than by syncing state in an effect keeps the render path honest.
 */
export function QuickViewModal({
    product,
    onClose,
}: {
    product: ProductCard | null;
    onClose: () => void;
}) {
    const { t } = useTranslation(['common', 'product']);
    const { add } = useCart();
    const [quantity, setQuantity] = useState(1);
    const dialogRef = useRef<HTMLDivElement>(null);
    const previouslyFocused = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!product) {
            return;
        }

        previouslyFocused.current =
            document.activeElement as HTMLElement | null;
        dialogRef.current?.focus();

        document.body.style.overflow = 'hidden';

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
            previouslyFocused.current?.focus();
        };
    }, [product, onClose]);

    if (!product) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center px-5 py-10"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
        >
            <button
                type="button"
                className="absolute inset-0 cursor-default bg-ink/55"
                aria-label={t('common:actions.close')}
                onClick={onClose}
            />

            <div
                ref={dialogRef}
                tabIndex={-1}
                className="relative max-h-full w-full max-w-3xl overflow-y-auto rounded-panel border border-hairline bg-surface shadow-[0_8px_40px_rgba(38,34,29,0.18)]"
            >
                <div className="absolute top-3 right-3 z-10">
                    <IconButton
                        variant="surface"
                        label={t('common:actions.close')}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>

                <div className="grid gap-0 sm:grid-cols-2">
                    <div className="bg-sand">
                        <Media
                            media={product.media}
                            ratio="1/1"
                            label={`Product — ${product.name}`}
                        />
                    </div>

                    <div className="flex flex-col gap-3 p-6">
                        <h2 className="font-display text-2xl font-medium">
                            {product.name}
                        </h2>

                        <Rating
                            value={product.rating}
                            count={product.reviewsCount}
                        />

                        <Price
                            amount={product.priceMinor}
                            currency={product.currency}
                            compareAtAmount={product.compareAtPriceMinor}
                            size="lg"
                        />

                        {product.shortDescription && (
                            <p className="text-copy text-ink-muted">
                                {product.shortDescription}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {product.isVegetarian && (
                                <Badge variant="sand">
                                    {t('common:badge.vegetarian')}
                                </Badge>
                            )}
                            <Badge
                                variant={product.isInStock ? 'outline' : 'sale'}
                            >
                                {product.isInStock
                                    ? t('product:stock.inStock')
                                    : t('product:stock.outOfStock')}
                            </Badge>
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                            <span className="flex items-center rounded-btn border-hairline">
                                <IconButton
                                    size="sm"
                                    label={t('cart:actions.decrease', {
                                        defaultValue: 'Decrease quantity',
                                    })}
                                    onClick={() =>
                                        setQuantity((value) =>
                                            Math.max(1, value - 1),
                                        )
                                    }
                                >
                                    <MinusIcon />
                                </IconButton>
                                <span
                                    className="w-9 text-center text-copy"
                                    aria-live="polite"
                                    aria-label={t('common:labels.quantity')}
                                >
                                    {quantity}
                                </span>
                                <IconButton
                                    size="sm"
                                    label={t('cart:actions.increase', {
                                        defaultValue: 'Increase quantity',
                                    })}
                                    onClick={() =>
                                        setQuantity((value) => value + 1)
                                    }
                                >
                                    <PlusIcon />
                                </IconButton>
                            </span>

                            <Button
                                variant="primary"
                                className="flex-1"
                                disabled={!product.isInStock}
                                onClick={() => {
                                    add(product, quantity);
                                    onClose();
                                }}
                            >
                                {t('common:actions.addToCart')}
                                <BagIcon width={15} height={15} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
