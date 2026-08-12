import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/drio/button';
import { IconButton } from '@/components/drio/icon-button';
import { BagIcon, HeartIcon } from '@/components/drio/icons/ui';
import { Media } from '@/components/drio/media';
import { Price } from '@/components/drio/price';
import { Rating } from '@/components/drio/rating';
import { useCart } from '@/hooks/use-cart';
import { useReveal } from '@/hooks/use-reveal';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';
import { show } from '@/routes/products';
import type { ProductCard as ProductCardData } from '@/types/storefront';

/**
 * The product card (§7.4).
 *
 * `paper` surface with a `line` border, square `sand` media, a white circular
 * wishlist heart at top-right that fills `chilli` when toggled, then name,
 * rating, price and the outline/gold button row.
 */
export function ProductCard({
    product,
    index = 0,
    onQuickView,
}: {
    product: ProductCardData;
    index?: number;
    onQuickView?: (product: ProductCardData) => void;
}) {
    const { t } = useTranslation(['common', 'product']);
    const { has, toggle } = useWishlist();
    const { add } = useCart();
    const ref = useReveal<HTMLLIElement>({ delay: index * 60 });

    const isWishlisted = has(product.id);

    return (
        <li ref={ref} className="drio-reveal">
            <article className="group/card flex h-full flex-col overflow-hidden rounded-card border border-hairline bg-surface transition-shadow duration-300 hover:shadow-[0_2px_10px_rgba(38,34,29,0.07)]">
                <div className="relative overflow-hidden bg-sand">
                    <Link href={show(product.slug)} tabIndex={-1} aria-hidden>
                        <Media
                            media={product.media}
                            ratio="1/1"
                            label={`Product — ${product.name}`}
                            imageClassName="transition-transform duration-[600ms] ease-media group-hover/card:scale-[1.03]"
                            className="transition-transform duration-[600ms] ease-media group-hover/card:scale-[1.03]"
                        />
                    </Link>

                    <IconButton
                        variant="surface"
                        size="sm"
                        label={
                            isWishlisted
                                ? t('common:labels.removeFromWishlist')
                                : t('common:labels.addToWishlist')
                        }
                        aria-pressed={isWishlisted}
                        onClick={() => toggle(product.id)}
                        className={cn(
                            'absolute top-3 right-3',
                            isWishlisted && 'border-chilli/30 text-chilli',
                        )}
                    >
                        <HeartIcon
                            filled={isWishlisted}
                            width={16}
                            height={16}
                        />
                    </IconButton>

                    {!product.isInStock && (
                        <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-1.5 text-center drio-eyebrow text-white">
                            {t('common:badge.soldOut')}
                        </span>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-3">
                    {/*
                     * Two lines reserved whether the name needs them or not,
                     * so the rating, price and button row stay on a common
                     * baseline across the row (§11 — no shifting).
                     */}
                    <h3 className="line-clamp-2 min-h-[2.6em] font-display text-title text-ink">
                        <Link
                            href={show(product.slug)}
                            className="transition-colors hover:text-gold-700"
                        >
                            {product.name}
                        </Link>
                    </h3>

                    <Rating
                        value={product.rating}
                        count={product.reviewsCount}
                    />

                    <Price
                        amount={product.priceMinor}
                        currency={product.currency}
                        compareAtAmount={product.compareAtPriceMinor}
                    />

                    {/*
                     * Five cards inside §5's 1280px container leaves ~195px of
                     * row — tighter than the mockup, which is drawn on a wider
                     * container. The buttons are compact enough to sit side by
                     * side in English, and the row wraps to two full-width
                     * rows rather than clipping when a longer translation
                     * needs the space (§9 — a translation must never break the
                     * layout).
                     */}
                    <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="min-w-[5rem] flex-1 gap-1 px-2 text-[0.75rem]"
                            onClick={() => onQuickView?.(product)}
                        >
                            {t('common:actions.quickView')}
                        </Button>

                        <Button
                            variant="primary"
                            size="sm"
                            className="min-w-[5rem] flex-1 gap-1 px-2 text-[0.75rem]"
                            disabled={!product.isInStock}
                            onClick={() => add(product)}
                        >
                            {t('common:actions.addToCart')}
                            <BagIcon
                                width={13}
                                height={13}
                                className="shrink-0"
                            />
                        </Button>
                    </div>
                </div>
            </article>
        </li>
    );
}
