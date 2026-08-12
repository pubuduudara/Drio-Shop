import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/components/drio/price';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import type { CartTotals } from '@/types/cart';

/**
 * How far the basket is from free shipping (§6).
 *
 * Rendered from the same totals the server calculated, so the bar and the
 * shipping line in the summary cannot disagree. Silent when no threshold is
 * configured — an empty bar reading "¥0 to go" is worse than nothing.
 */
export function FreeShippingProgress({
    totals,
    className,
}: {
    totals: CartTotals;
    className?: string;
}) {
    const { t } = useTranslation('cart');
    const { locale } = useLocale();

    if (totals.freeShippingThresholdMinor <= 0 || totals.subtotalMinor === 0) {
        return null;
    }

    const progress = Math.min(
        100,
        Math.round(
            (totals.subtotalMinor / totals.freeShippingThresholdMinor) * 100,
        ),
    );

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <p className="text-small text-ink-muted" aria-live="polite">
                {totals.hasFreeShipping
                    ? t('summary.freeShippingReached')
                    : t('summary.freeShippingProgress', {
                          amount: formatPrice(
                              totals.freeShippingRemainingMinor,
                              totals.currency,
                              locale,
                          ),
                      })}
            </p>

            {/*
             * Decorative: the sentence above already says the same thing, and
             * a screen reader reading a percentage adds nothing (§11).
             */}
            <div
                className="h-1 w-full overflow-hidden rounded-full bg-line"
                aria-hidden
            >
                <div
                    className="h-full rounded-full bg-gold transition-[width] duration-500 ease-drio"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
