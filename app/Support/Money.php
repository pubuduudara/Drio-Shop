<?php

declare(strict_types=1);

namespace App\Support;

use NumberFormatter;

/**
 * Formats integer minor units for anything the server renders — the packing
 * slip, a CSV export, a future receipt email (§2).
 *
 * The server-side counterpart to `formatPrice` in resources/js. Both divide by
 * the same rule, so ¥1,580 on the slip and ¥1,580 on the confirmation page
 * cannot drift apart.
 */
final class Money
{
    /**
     * Currencies with no minor unit, where the stored integer is already the
     * displayed amount. Anything absent from this set is divided by 100.
     */
    private const array ZERO_DECIMAL = ['JPY', 'KRW', 'VND', 'CLP', 'ISK'];

    public static function format(int $minor, ?string $currency = null, ?string $locale = null): string
    {
        $currency ??= Setting::currency();
        $locale ??= app()->getLocale();

        $amount = in_array($currency, self::ZERO_DECIMAL, true) ? $minor : $minor / 100;

        if (! class_exists(NumberFormatter::class)) {
            // ext-intl is not guaranteed on every host; a readable fallback
            // beats a fatal on a page someone is trying to print.
            return $currency.' '.number_format($amount);
        }

        $formatter = new NumberFormatter($locale, NumberFormatter::CURRENCY);

        return (string) $formatter->formatCurrency((float) $amount, $currency);
    }
}
