import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '@/components/drio/button';
import { IconButton } from '@/components/drio/icon-button';
import { MinusIcon, PlusIcon } from '@/components/drio/icons/ui';
import { Media } from '@/components/drio/media';
import { Price } from '@/components/drio/price';
import { SectionHeader } from '@/components/drio/section-header';
import { FreeShippingProgress } from '@/components/storefront/free-shipping-progress';
import { OrderSummary } from '@/components/storefront/order-summary';
import { StorefrontPageHeader } from '@/components/storefront/page-header';
import { ProductGrid } from '@/components/storefront/product-grid';
import { useCart } from '@/hooks/use-cart';
import { home, shop } from '@/routes';
import { show as checkoutShow } from '@/routes/checkout';
import { show as productShow } from '@/routes/products';
import type { ProductCard } from '@/types/storefront';

/**
 * The cart page (§7.12).
 *
 * The drawer is for a glance mid-browse; this is where quantities get sorted
 * out before checkout. Both read the same shared cart prop, so they can never
 * disagree about what is in the basket.
 */
export default function CartPage({
    suggestions,
}: {
    suggestions: ProductCard[];
}) {
    const { t } = useTranslation(['cart', 'nav', 'common']);
    const { lines, count, totals, remove, setQuantity } = useCart();
    const { errors } = usePage().props;

    return (
        <>
            <Head title={t('cart:title')} />

            <StorefrontPageHeader
                eyebrow={t('cart:eyebrow')}
                title={t('cart:title')}
                description={
                    count > 0 ? t('cart:itemCount', { count }) : undefined
                }
                crumbs={[
                    { label: t('nav:primary.home'), href: home().url },
                    { label: t('cart:title') },
                ]}
            />

            <div className="mx-auto max-w-drio px-5 py-10 md:px-8 md:py-12 lg:px-10">
                {/*
                 * Checkout bounces back here when stock ran out between the
                 * review step and the submit, so the reason has to land where
                 * the customer can act on it (§7.12).
                 */}
                {errors.checkout && (
                    <p
                        role="alert"
                        className="mb-6 rounded-card border border-chilli/40 bg-chilli/5 px-4 py-3 text-copy text-chilli"
                    >
                        {errors.checkout}
                    </p>
                )}

                {lines.length === 0 ? (
                    <EmptyCart suggestions={suggestions} />
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
                        <section aria-labelledby="cart-lines">
                            <h2 id="cart-lines" className="sr-only">
                                {t('cart:title')}
                            </h2>

                            <ul className="border-t border-hairline">
                                {lines.map((line) => (
                                    <li
                                        key={line.id}
                                        className="flex gap-4 border-b border-hairline py-5"
                                    >
                                        <Link
                                            href={productShow(line.slug)}
                                            className="w-24 shrink-0 sm:w-28"
                                            tabIndex={-1}
                                            aria-hidden
                                        >
                                            <Media
                                                media={line.media}
                                                ratio="1/1"
                                                label={`Product — ${line.name}`}
                                                rounded="card"
                                            />
                                        </Link>

                                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <h3 className="font-display text-title">
                                                    <Link
                                                        href={productShow(
                                                            line.slug,
                                                        )}
                                                        className="transition-colors hover:text-gold-700"
                                                    >
                                                        {line.name}
                                                    </Link>
                                                </h3>

                                                <Price
                                                    amount={line.lineTotalMinor}
                                                    currency={totals.currency}
                                                />
                                            </div>

                                            <Price
                                                amount={line.unitPriceMinor}
                                                currency={totals.currency}
                                                size="sm"
                                                className="text-ink-muted"
                                            />

                                            <div className="mt-auto flex flex-wrap items-center gap-3">
                                                <span className="flex items-center rounded-btn border border-hairline">
                                                    <IconButton
                                                        size="sm"
                                                        label={t(
                                                            'cart:actions.decrease',
                                                        )}
                                                        onClick={() =>
                                                            setQuantity(
                                                                line.id,
                                                                line.quantity -
                                                                    1,
                                                            )
                                                        }
                                                    >
                                                        <MinusIcon />
                                                    </IconButton>
                                                    <span className="w-9 text-center text-copy tabular-nums">
                                                        {line.quantity}
                                                    </span>
                                                    <IconButton
                                                        size="sm"
                                                        label={t(
                                                            'cart:actions.increase',
                                                        )}
                                                        disabled={
                                                            line.quantity >=
                                                            line.stockQuantity
                                                        }
                                                        onClick={() =>
                                                            setQuantity(
                                                                line.id,
                                                                line.quantity +
                                                                    1,
                                                            )
                                                        }
                                                    >
                                                        <PlusIcon />
                                                    </IconButton>
                                                </span>

                                                {line.quantity >=
                                                    line.stockQuantity && (
                                                    <span className="text-small text-ink-muted">
                                                        {t('cart:stock.max', {
                                                            count: line.stockQuantity,
                                                        })}
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        remove(line.id)
                                                    }
                                                    className="ml-auto text-small text-ink-muted transition-colors hover:text-chilli"
                                                >
                                                    {t('cart:actions.remove')}
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6">
                                <ButtonLink
                                    href={shop()}
                                    variant="ghost"
                                    size="sm"
                                    className="px-0"
                                >
                                    ← {t('cart:actions.continueShopping')}
                                </ButtonLink>
                            </div>
                        </section>

                        <aside className="lg:sticky lg:top-28 lg:self-start">
                            <FreeShippingProgress
                                totals={totals}
                                className="mb-4"
                            />

                            <OrderSummary totals={totals}>
                                <ButtonLink
                                    href={checkoutShow()}
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                >
                                    {t('cart:actions.checkout')}
                                </ButtonLink>
                            </OrderSummary>
                        </aside>
                    </div>
                )}
            </div>
        </>
    );
}

function EmptyCart({ suggestions }: { suggestions: ProductCard[] }) {
    const { t } = useTranslation('cart');

    return (
        <>
            <div className="flex flex-col items-center gap-4 rounded-card border border-hairline bg-surface px-6 py-16 text-center">
                <p className="font-display text-section">{t('empty.title')}</p>
                <p className="max-w-md text-copy text-ink-muted">
                    {t('empty.body')}
                </p>
                <ButtonLink href={shop()} variant="primary" size="lg" withArrow>
                    {t('empty.action')}
                </ButtonLink>
            </div>

            {suggestions.length > 0 && (
                <section className="mt-14">
                    <SectionHeader title={t('empty.suggestions')} />

                    <div className="mt-8">
                        <ProductGrid
                            products={suggestions}
                            emptyMessage=""
                            columns={4}
                        />
                    </div>
                </section>
            )}
        </>
    );
}
