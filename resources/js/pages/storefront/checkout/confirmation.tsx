import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '@/components/drio/button';
import { BotanicalRule } from '@/components/drio/icons/botanical';
import { CheckIcon } from '@/components/drio/icons/ui';
import { formatPrice } from '@/components/drio/price';
import { useLocale } from '@/hooks/use-locale';
import { shop } from '@/routes';
import type { Order } from '@/types/cart';

/**
 * The order confirmation (§7.12).
 *
 * Reached once after checkout, or by the account that owns the order. Every
 * figure comes from the order's own snapshots, so this page reads the same
 * three years from now as it does today.
 */
export default function Confirmation({ order }: { order: Order }) {
    const { t } = useTranslation(['checkout', 'cart']);
    const { locale } = useLocale();

    const money = (minor: number) =>
        formatPrice(minor, order.totals.currency, locale);

    return (
        <>
            <Head title={t('checkout:confirmation.title')} />

            <div className="mx-auto max-w-3xl px-5 pt-32 pb-16 md:px-8 md:pt-36 md:pb-20">
                <div className="flex flex-col items-center text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-forest text-cream">
                        <CheckIcon width={22} height={22} />
                    </span>

                    <p className="mt-5 drio-eyebrow text-gold-700">
                        {t('checkout:confirmation.eyebrow')}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                        <h1 className="font-display text-section font-medium">
                            {t('checkout:confirmation.title')}
                        </h1>
                        <BotanicalRule
                            className="mt-1 shrink-0 text-gold"
                            aria-hidden
                        />
                    </div>

                    <p className="mt-3 font-mono text-small text-ink-muted">
                        {t('checkout:confirmation.orderNumber', {
                            number: order.orderNumber,
                        })}
                    </p>

                    <p className="mt-4 max-w-lg text-copy text-ink-muted">
                        {t('checkout:confirmation.body', {
                            email: order.customer.email,
                        })}
                    </p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                    <section className="rounded-card border border-hairline bg-surface p-5">
                        <h2 className="drio-eyebrow text-ink-muted">
                            {t('checkout:confirmation.shippingTo')}
                        </h2>

                        <address className="mt-2 text-copy not-italic">
                            {order.customer.name}
                            <br />〒{order.shippingAddress.postalCode}
                            <br />
                            {order.shippingAddress.prefecture},{' '}
                            {order.shippingAddress.city}
                            <br />
                            {order.shippingAddress.addressLine1}
                            {order.shippingAddress.addressLine2 && (
                                <>
                                    <br />
                                    {order.shippingAddress.addressLine2}
                                </>
                            )}
                        </address>
                    </section>

                    <section className="rounded-card border border-hairline bg-surface p-5">
                        <h2 className="drio-eyebrow text-ink-muted">
                            {t('cart:summary.title')}
                        </h2>

                        <dl className="mt-2 flex flex-col gap-1.5 text-copy">
                            <Row label={t('cart:summary.subtotal')}>
                                {money(order.totals.subtotalMinor)}
                            </Row>
                            <Row label={t('cart:summary.shipping')}>
                                {order.totals.shippingMinor === 0
                                    ? t('cart:summary.freeShipping')
                                    : money(order.totals.shippingMinor)}
                            </Row>
                            <div className="mt-1 flex items-baseline justify-between border-t border-hairline pt-2">
                                <dt className="font-display text-lg">
                                    {t('cart:summary.total')}
                                </dt>
                                <dd className="font-display text-lg font-semibold">
                                    {money(order.totals.totalMinor)}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <section className="mt-6 rounded-card border border-hairline bg-surface p-5">
                    <h2 className="drio-eyebrow text-ink-muted">
                        {t('checkout:confirmation.items')}
                    </h2>

                    <ul className="mt-3 divide-y divide-hairline">
                        {(order.items ?? []).map((item) => (
                            <li
                                key={item.id}
                                className="flex items-baseline justify-between gap-4 py-2.5"
                            >
                                <span className="min-w-0">
                                    <span className="text-copy text-ink">
                                        {item.name}
                                    </span>
                                    <span className="ml-2 text-small text-ink-muted">
                                        × {item.quantity}
                                    </span>
                                </span>
                                <span className="shrink-0 text-copy tabular-nums">
                                    {money(item.lineTotalMinor)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="mt-10 text-center">
                    <ButtonLink href={shop()} variant="outline" withArrow>
                        {t('checkout:confirmation.continue')}
                    </ButtonLink>
                </div>
            </div>
        </>
    );
}

function Row({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="tabular-nums">{children}</dd>
        </div>
    );
}
