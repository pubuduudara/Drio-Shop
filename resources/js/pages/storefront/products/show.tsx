import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/drio/badge';
import { Button } from '@/components/drio/button';
import { IconButton } from '@/components/drio/icon-button';
import {
    BagIcon,
    HeartIcon,
    MinusIcon,
    PlusIcon,
} from '@/components/drio/icons/ui';
import { Media } from '@/components/drio/media';
import type { MediaRecord } from '@/components/drio/media';
import { Price } from '@/components/drio/price';
import { Rating } from '@/components/drio/rating';
import { SectionHeader } from '@/components/drio/section-header';
import { ProductGrid } from '@/components/storefront/product-grid';
import { RecipeInspiration } from '@/components/storefront/recipe-inspiration';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';
import { home, shop } from '@/routes';
import { show as categoryShow } from '@/routes/categories';
import type {
    CustomerReview,
    ProductCard,
    RecipeCard,
} from '@/types/storefront';
import type { ProductDetail } from '@/types/storefront-detail';

/**
 * The product detail page (§7.12): gallery, tabs, related products and
 * reviews.
 *
 * This page carries the storefront's only `h1` for the product, and every
 * media slot reserves its aspect ratio so swapping placeholders for
 * photography shifts nothing (§3, §11).
 */
export default function ProductShow({
    product,
    reviews,
    related,
    recipes,
}: {
    product: ProductDetail;
    reviews: CustomerReview[];
    related: ProductCard[];
    recipes: RecipeCard[];
}) {
    const { t } = useTranslation(['product', 'common', 'nav', 'shop']);
    const { add } = useCart();
    const { has, toggle } = useWishlist();

    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [tab, setTab] = useState<'description' | 'details' | 'reviews'>(
        'description',
    );

    const isWishlisted = has(product.id);

    /* The card shape this page's Add to Cart needs, built from the detail. */
    const asCard: ProductCard = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        priceMinor: product.priceMinor,
        compareAtPriceMinor: product.compareAtPriceMinor,
        currency: product.currency,
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        isInStock: product.isInStock,
        isVegetarian: product.isVegetarian,
        media: product.gallery[0] ?? null,
    };

    return (
        <>
            <Head title={product.name} />

            <div className="mx-auto max-w-drio px-5 pt-28 pb-12 md:px-8 md:pt-32 lg:px-10">
                <nav
                    aria-label={t('common:aria.breadcrumb')}
                    className="text-small text-ink-muted"
                >
                    <ol className="flex flex-wrap items-center gap-1.5">
                        <li>
                            <Link href={home()} className="hover:text-gold-700">
                                {t('nav:primary.home')}
                            </Link>
                        </li>
                        <li aria-hidden>/</li>
                        <li>
                            <Link href={shop()} className="hover:text-gold-700">
                                {t('shop:title')}
                            </Link>
                        </li>
                        {product.category && (
                            <>
                                <li aria-hidden>/</li>
                                <li>
                                    <Link
                                        href={categoryShow(
                                            product.category.slug,
                                        )}
                                        className="hover:text-gold-700"
                                    >
                                        {product.category.name}
                                    </Link>
                                </li>
                            </>
                        )}
                        <li aria-hidden>/</li>
                        <li aria-current="page" className="text-ink">
                            {product.name}
                        </li>
                    </ol>
                </nav>

                <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
                    <Gallery
                        gallery={product.gallery}
                        name={product.name}
                        active={activeImage}
                        onSelect={setActiveImage}
                    />

                    <div className="flex flex-col gap-4">
                        <h1 className="font-display text-section font-medium text-ink">
                            {product.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3">
                            <Rating
                                value={product.rating}
                                count={product.reviewsCount}
                            />
                            <StockBadge product={product} />
                            {product.isVegetarian && (
                                <Badge variant="sand">
                                    {t('common:badge.vegetarian')}
                                </Badge>
                            )}
                        </div>

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

                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="flex items-center rounded-btn border border-hairline bg-surface">
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
                                    className="w-10 text-center text-copy tabular-nums"
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
                                size="lg"
                                className="flex-1"
                                disabled={!product.isInStock}
                                onClick={() => add(asCard, quantity)}
                            >
                                {t('common:actions.addToCart')}
                                <BagIcon width={16} height={16} />
                            </Button>

                            <IconButton
                                variant="surface"
                                label={
                                    isWishlisted
                                        ? t('common:labels.removeFromWishlist')
                                        : t('common:labels.addToWishlist')
                                }
                                aria-pressed={isWishlisted}
                                onClick={() => toggle(product.id)}
                                className={cn(
                                    isWishlisted &&
                                        'border-chilli/30 text-chilli',
                                )}
                            >
                                <HeartIcon filled={isWishlisted} />
                            </IconButton>
                        </div>

                        <dl className="mt-2 grid gap-1.5 border-t border-hairline pt-4 text-small">
                            <Detail
                                label={t('product:details.sku')}
                                value={product.sku}
                            />
                            {product.weightGrams !== null && (
                                <Detail
                                    label={t('product:details.weight')}
                                    value={t('product:details.weightValue', {
                                        grams: product.weightGrams,
                                    })}
                                />
                            )}
                            {product.category && (
                                <Detail
                                    label={t('product:details.category')}
                                    value={product.category.name}
                                />
                            )}
                        </dl>
                    </div>
                </div>

                {/* Tabs (§7.12). */}
                <section className="mt-14">
                    <div
                        role="tablist"
                        className="flex flex-wrap items-center gap-6 border-b border-hairline"
                    >
                        {(['description', 'details', 'reviews'] as const).map(
                            (key) => (
                                <button
                                    key={key}
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === key}
                                    onClick={() => setTab(key)}
                                    className={cn(
                                        '-mb-px border-b-2 pb-3 text-copy transition-colors',
                                        tab === key
                                            ? 'border-gold text-ink'
                                            : 'border-transparent text-ink-muted hover:text-ink',
                                    )}
                                >
                                    {t(`product:tabs.${key}`)}
                                    {key === 'reviews' &&
                                        product.reviewsCount > 0 &&
                                        ` (${product.reviewsCount})`}
                                </button>
                            ),
                        )}
                    </div>

                    <div className="pt-6">
                        {tab === 'description' && (
                            <div className="max-w-2xl text-copy whitespace-pre-line text-ink-muted">
                                {product.description ||
                                    t('product:noDescription')}
                            </div>
                        )}

                        {tab === 'details' && (
                            <dl className="grid max-w-lg gap-2 text-copy">
                                <Detail
                                    label={t('product:details.sku')}
                                    value={product.sku}
                                />
                                {product.weightGrams !== null && (
                                    <Detail
                                        label={t('product:details.weight')}
                                        value={t(
                                            'product:details.weightValue',
                                            { grams: product.weightGrams },
                                        )}
                                    />
                                )}
                                {product.category && (
                                    <Detail
                                        label={t('product:details.category')}
                                        value={product.category.name}
                                    />
                                )}
                                <Detail
                                    label={t('product:details.dietary')}
                                    value={
                                        product.isVegetarian
                                            ? t('product:details.vegetarian')
                                            : '—'
                                    }
                                />
                            </dl>
                        )}

                        {tab === 'reviews' && <Reviews reviews={reviews} />}
                    </div>
                </section>
            </div>

            {related.length > 0 && (
                <section className="bg-band">
                    <div className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
                        <SectionHeader title={t('product:related')} />

                        <div className="mt-8">
                            <ProductGrid
                                products={related}
                                emptyMessage=""
                                columns={4}
                            />
                        </div>
                    </div>
                </section>
            )}

            {recipes.length > 0 && <RecipeInspiration recipes={recipes} />}
        </>
    );
}

/** The image gallery: one large slot plus thumbnails when there is more than one. */
function Gallery({
    gallery,
    name,
    active,
    onSelect,
}: {
    gallery: (MediaRecord | null)[];
    name: string;
    active: number;
    onSelect: (index: number) => void;
}) {
    const { t } = useTranslation('product');

    return (
        <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-panel border border-hairline bg-sand">
                <Media
                    media={gallery[active] ?? null}
                    ratio="1/1"
                    label={`Product — ${name}`}
                    priority
                />
            </div>

            {gallery.length > 1 && (
                <ul
                    className="grid grid-cols-5 gap-2"
                    aria-label={t('gallery.label')}
                >
                    {gallery.map((image, index) => (
                        <li key={index}>
                            <button
                                type="button"
                                aria-label={t('gallery.select', {
                                    index: index + 1,
                                })}
                                aria-pressed={index === active}
                                onClick={() => onSelect(index)}
                                className={cn(
                                    'block w-full overflow-hidden rounded-card border transition-colors',
                                    index === active
                                        ? 'border-gold'
                                        : 'border-hairline hover:border-ink/30',
                                )}
                            >
                                <Media
                                    media={image}
                                    ratio="1/1"
                                    label={`Product — ${name}`}
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function StockBadge({ product }: { product: ProductDetail }) {
    const { t } = useTranslation('product');

    if (!product.isInStock) {
        return <Badge variant="sale">{t('stock.outOfStock')}</Badge>;
    }

    if (product.isLowStock) {
        return (
            <Badge variant="clay">
                {t('stock.lowStock', { count: product.stockQuantity })}
            </Badge>
        );
    }

    return <Badge variant="outline">{t('stock.inStock')}</Badge>;
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline gap-3">
            <dt className="w-28 shrink-0 text-ink-muted">{label}</dt>
            <dd className="text-ink">{value}</dd>
        </div>
    );
}

function Reviews({ reviews }: { reviews: CustomerReview[] }) {
    const { t } = useTranslation('product');

    if (reviews.length === 0) {
        return <p className="text-copy text-ink-muted">{t('reviews.empty')}</p>;
    }

    return (
        <ul className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
                <li
                    key={review.id}
                    className="rounded-card border border-hairline bg-surface p-5"
                >
                    <Rating value={review.rating} />
                    <p className="mt-3 text-copy text-ink-muted">
                        {review.body}
                    </p>
                    <p className="mt-4 text-small text-ink">
                        — {review.customerName}
                        {review.customerCity && `, ${review.customerCity}`}
                    </p>
                </li>
            ))}
        </ul>
    );
}
