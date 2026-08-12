<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Cart;
use App\Models\Setting;

/**
 * What an order costs (§6).
 *
 * The one place that knows the shipping rules, so the drawer, the cart page,
 * the checkout review step and the order the server writes cannot disagree —
 * a total the customer read and a total that was charged differing by ¥600 is
 * the kind of bug that arrives as a chargeback.
 *
 * Every amount is integer minor units (§2).
 *
 * @phpstan-type TotalsPayload array{subtotalMinor: int, shippingMinor: int, taxMinor: int, totalMinor: int, currency: string, freeShippingThresholdMinor: int, freeShippingRemainingMinor: int, hasFreeShipping: bool}
 */
final class OrderTotals
{
    private function __construct(
        public readonly int $subtotalMinor,
        public readonly int $shippingMinor,
        public readonly int $taxMinor,
        public readonly string $currency,
        public readonly int $freeShippingThresholdMinor,
    ) {}

    public static function forCart(?Cart $cart): self
    {
        $subtotal = $cart === null
            ? 0
            : (int) $cart->items->sum(fn ($item): int => $item->lineTotalMinor());

        return self::forSubtotal($subtotal, $cart?->currency);
    }

    public static function forSubtotal(int $subtotalMinor, ?string $currency = null): self
    {
        $threshold = Setting::freeShippingThresholdMinor();

        /*
         * An empty basket ships for nothing: charging ¥600 postage on a ¥0
         * cart would make the drawer read as if something were already owed.
         */
        $shipping = match (true) {
            $subtotalMinor === 0 => 0,
            $threshold > 0 && $subtotalMinor >= $threshold => 0,
            default => Setting::shippingFlatRateMinor(),
        };

        return new self(
            subtotalMinor: $subtotalMinor,
            shippingMinor: $shipping,
            /*
             * Zero by design, not by omission. Japanese retail prices are
             * quoted tax-inclusive, so the consumption tax is already inside
             * `price_minor`; breaking it out needs the client's confirmed tax
             * treatment and registration number, and inventing a rate here
             * would put a wrong figure on a receipt.
             */
            taxMinor: 0,
            currency: $currency ?? Setting::currency(),
            freeShippingThresholdMinor: $threshold,
        );
    }

    public function totalMinor(): int
    {
        return $this->subtotalMinor + $this->shippingMinor + $this->taxMinor;
    }

    public function hasFreeShipping(): bool
    {
        return $this->subtotalMinor > 0 && $this->shippingMinor === 0;
    }

    /** What is still needed to cross the free-shipping line, or zero. */
    public function freeShippingRemainingMinor(): int
    {
        if ($this->freeShippingThresholdMinor <= 0 || $this->hasFreeShipping()) {
            return 0;
        }

        return max(0, $this->freeShippingThresholdMinor - $this->subtotalMinor);
    }

    /**
     * @return TotalsPayload
     */
    public function toArray(): array
    {
        return [
            'subtotalMinor' => $this->subtotalMinor,
            'shippingMinor' => $this->shippingMinor,
            'taxMinor' => $this->taxMinor,
            'totalMinor' => $this->totalMinor(),
            'currency' => $this->currency,
            'freeShippingThresholdMinor' => $this->freeShippingThresholdMinor,
            'freeShippingRemainingMinor' => $this->freeShippingRemainingMinor(),
            'hasFreeShipping' => $this->hasFreeShipping(),
        ];
    }
}
