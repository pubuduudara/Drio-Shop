import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/components/drio/price';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import type { CartTotals } from '@/types/cart';

/**
 * Subtotal, shipping and total, as one block (§7.12).
 *
 * Shared by the cart page and the checkout review step so the figure a
 * customer agrees to and the figure they are charged are rendered from the
 * same server-calculated totals.
 */
export function OrderSummary({
    totals,
    children,
    className,
}: {
    totals: CartTotals;
    /** The action beneath the figures — checkout, or place order. */
    children?: ReactNode;
    className?: string;
}) {
    const { t } = useTranslation('cart');
    const { locale } = useLocale();

    const money = (minor: number) =>
        formatPrice(minor, totals.currency, locale);

    return (
        <div
            className={cn(
                'rounded-card border border-hairline bg-surface p-5',
                className,
            )}
        >
            <h2 className="font-display text-xl font-medium">
                {t('summary.title')}
            </h2>

            <dl className="mt-4 flex flex-col gap-2.5 text-copy">
                <Row label={t('summary.subtotal')}>
                    {money(totals.subtotalMinor)}
                </Row>

                <Row label={t('summary.shipping')}>
                    {totals.hasFreeShipping ? (
                        <span className="text-forest-500">
                            {t('summary.freeShipping')}
                        </span>
                    ) : (
                        money(totals.shippingMinor)
                    )}
                </Row>

                {/*
                 * The tax line only appears when there is one. Japanese retail
                 * prices are quoted tax-inclusive, so the note carries the
                 * information a ¥0 row would only obscure.
                 */}
                {totals.taxMinor > 0 && (
                    <Row label={t('summary.tax')}>{money(totals.taxMinor)}</Row>
                )}

                <div
                    className="mt-1 flex items-baseline justify-between border-t border-hairline pt-3"
                    aria-live="polite"
                >
                    <dt className="font-display text-xl">
                        {t('summary.total')}
                    </dt>
                    <dd className="font-display text-xl font-semibold">
                        {money(totals.totalMinor)}
                    </dd>
                </div>
            </dl>

            <p className="mt-2 text-small text-ink-muted">
                {t('summary.taxNote')}
            </p>

            {children && <div className="mt-5">{children}</div>}
        </div>
    );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="tabular-nums">{children}</dd>
        </div>
    );
}
