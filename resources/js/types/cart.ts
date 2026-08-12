import type { MediaRecord } from '@/components/drio/media';

/**
 * The cart as `App\Http\Resources\CartResource` shares it on every storefront
 * page (§6).
 *
 * Every amount is integer minor units (§2), and the product name arrives as a
 * plain string because the resource resolved it in the active locale (§9.4).
 */

export type CartLine = {
    /** The `cart_items` row id — what the update and remove endpoints take. */
    id: number;
    productId: number;
    name: string;
    slug: string;
    unitPriceMinor: number;
    lineTotalMinor: number;
    quantity: number;
    /** What the shelf holds, so a stepper cannot offer a unit that isn't there. */
    stockQuantity: number;
    media: MediaRecord | null;
};

export type CartTotals = {
    subtotalMinor: number;
    shippingMinor: number;
    taxMinor: number;
    totalMinor: number;
    currency: string;
    freeShippingThresholdMinor: number;
    /** What is still needed to cross the free-shipping line, or zero. */
    freeShippingRemainingMinor: number;
    hasFreeShipping: boolean;
};

export type Cart = {
    lines: CartLine[];
    /** Total units, which is the number on the header's bag badge. */
    count: number;
    totals: CartTotals;
};

export type OrderAddress = {
    postalCode: string;
    prefecture: string;
    city: string;
    addressLine1: string;
    addressLine2: string | null;
};

export type OrderLine = {
    id: number;
    productId: number | null;
    /** The snapshot, not the live product — see OrderResource. */
    name: string;
    sku: string;
    unitPriceMinor: number;
    quantity: number;
    lineTotalMinor: number;
};

export type Order = {
    id: number;
    orderNumber: string;
    status: string;
    customer: { name: string; email: string; phone: string | null };
    shippingAddress: OrderAddress;
    totals: {
        subtotalMinor: number;
        shippingMinor: number;
        taxMinor: number;
        totalMinor: number;
        currency: string;
    };
    items?: OrderLine[];
    notes: string | null;
    placedAt: string | null;
};
