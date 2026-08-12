import { router, usePage } from '@inertiajs/react';
import { useCallback, useSyncExternalStore } from 'react';
import cart from '@/routes/cart';
import type { Cart, CartLine } from '@/types/cart';
import type { ProductCard } from '@/types/storefront';

/**
 * The cart (§6, §7.4).
 *
 * The basket itself lives in the `carts` table and reaches every page as a
 * shared Inertia prop, so the header badge, the drawer and the cart page are
 * reading one value rather than three copies that can disagree. Every mutation
 * is a request that redirects back, which re-resolves that prop.
 *
 * Only the drawer's open state is client-side — it is interface state, not
 * data, and it must survive the visit that a mutation triggers.
 *
 * The call sites from Phase 3 are unchanged: `add`, `remove` and `setQuantity`
 * kept their signatures when the localStorage store behind them was replaced.
 */

const EMPTY_CART: Cart = {
    lines: [],
    count: 0,
    totals: {
        subtotalMinor: 0,
        shippingMinor: 0,
        taxMinor: 0,
        totalMinor: 0,
        currency: 'JPY',
        freeShippingThresholdMinor: 0,
        freeShippingRemainingMinor: 0,
        hasFreeShipping: false,
    },
};

let drawerOpen = false;
const drawerListeners = new Set<() => void>();

function subscribeDrawer(listener: () => void): () => void {
    drawerListeners.add(listener);

    return () => {
        drawerListeners.delete(listener);
    };
}

function setDrawerOpen(open: boolean): void {
    drawerOpen = open;

    for (const listener of drawerListeners) {
        listener();
    }
}

/** Every cart write is the same visit: stay put, keep the drawer open. */
const VISIT_OPTIONS = {
    preserveScroll: true,
    preserveState: true,
} as const;

export function useCart() {
    const current = usePage().props.cart ?? EMPTY_CART;

    const isDrawerOpen = useSyncExternalStore(
        subscribeDrawer,
        () => drawerOpen,
        () => false,
    );

    const add = useCallback((product: ProductCard, quantity = 1): void => {
        router.post(
            cart.store().url,
            { product_id: product.id, quantity },
            {
                ...VISIT_OPTIONS,
                // Optimistic in feel rather than in data: the drawer opens
                // immediately and fills in when the response lands, which is a
                // truthful basket a moment later rather than a hopeful one now.
                onSuccess: () => setDrawerOpen(true),
            },
        );
    }, []);

    const setQuantity = useCallback(
        (lineId: number, quantity: number): void => {
            router.patch(
                cart.items.update(lineId).url,
                { quantity },
                VISIT_OPTIONS,
            );
        },
        [],
    );

    const remove = useCallback((lineId: number): void => {
        router.delete(cart.items.destroy(lineId).url, VISIT_OPTIONS);
    }, []);

    return {
        lines: current.lines,
        count: current.count,
        totals: current.totals,
        subtotalMinor: current.totals.subtotalMinor,
        currency: current.totals.currency,
        add,
        remove,
        setQuantity,
        isDrawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
    };
}

export type { Cart, CartLine };
