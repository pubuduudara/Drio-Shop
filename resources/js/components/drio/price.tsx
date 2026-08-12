import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

export type PriceProps = {
    /**
     * Integer minor units, always. JPY has no decimal subunit, so 1580 is
     * ¥1,580 — but the type is minor units regardless of currency so a second
     * currency never silently changes the meaning of this number (§2).
     */
    amount: number;
    currency?: string;
    /** A struck-through was-price, also in minor units. */
    compareAtAmount?: number | null;
    size?: 'sm' | 'md' | 'lg';
    /** `dark` renders gold, for prices sitting on forest surfaces (§5). */
    tone?: 'default' | 'dark';
    className?: string;
};

/**
 * Currencies with no minor unit, where the stored integer is already the
 * displayed amount. Anything absent from this set is divided by 100.
 */
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'VND', 'CLP', 'ISK']);

function minorToMajor(amount: number, currency: string): number {
    return ZERO_DECIMAL_CURRENCIES.has(currency) ? amount : amount / 100;
}

/**
 * Formats integer minor units for display (§5.4).
 *
 * Exported separately so non-visual callers — an aria-label, a document title,
 * a cart total announcement — format money identically to the component.
 */
export function formatPrice(
    amount: number,
    currency: string,
    locale: string,
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
    }).format(minorToMajor(amount, currency));
}

const sizeClasses = {
    sm: 'text-small',
    md: 'text-title',
    lg: 'text-xl',
} as const;

export function Price({
    amount,
    currency = 'JPY',
    compareAtAmount,
    size = 'md',
    tone = 'default',
    className,
}: PriceProps) {
    const { locale } = useLocale();

    const hasCompareAt =
        typeof compareAtAmount === 'number' && compareAtAmount > amount;

    return (
        <span className={cn('inline-flex items-baseline gap-2', className)}>
            <span
                className={cn(
                    'font-body font-semibold',
                    sizeClasses[size],
                    tone === 'dark' ? 'text-gold' : 'text-ink',
                )}
            >
                {formatPrice(amount, currency, locale)}
            </span>

            {hasCompareAt && (
                <span
                    className={cn(
                        'text-small line-through',
                        tone === 'dark' ? 'text-cream/55' : 'text-ink-muted',
                    )}
                >
                    {formatPrice(compareAtAmount, currency, locale)}
                </span>
            )}
        </span>
    );
}
