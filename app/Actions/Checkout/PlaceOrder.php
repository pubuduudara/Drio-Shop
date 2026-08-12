<?php

declare(strict_types=1);

namespace App\Actions\Checkout;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Support\OrderTotals;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Turns a cart into an order (§6, §7.12).
 *
 * Everything happens inside one transaction with the product rows locked: two
 * customers checking out the last jar at the same moment must not both
 * succeed, and a stock decrement that outlives a failed order write is worse
 * than no order at all.
 *
 * Line items are snapshots. The name, SKU and unit price are copied onto the
 * order because a product can be renamed, repriced or deleted afterwards and
 * the record of what was bought must not change with it.
 */
final class PlaceOrder
{
    /**
     * @param  array<string, mixed>  $details  The validated CheckoutRequest data.
     *
     * @throws RuntimeException When the cart is empty or stock ran out.
     */
    public function handle(Cart $cart, array $details, ?int $userId = null): Order
    {
        return DB::transaction(function () use ($cart, $details, $userId): Order {
            $items = $cart->items()->with('product')->get();

            if ($items->isEmpty()) {
                throw new RuntimeException('cart_empty');
            }

            // Locked for the rest of the transaction, in a stable order so two
            // concurrent checkouts cannot deadlock against each other.
            $products = Product::query()
                ->whereIn('id', $items->pluck('product_id'))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($items as $item) {
                $product = $products->get($item->product_id);

                if ($product === null || ! $product->is_active) {
                    throw new RuntimeException('unavailable');
                }

                if ($product->stock_quantity < $item->quantity) {
                    throw new RuntimeException('insufficient_stock');
                }
            }

            /*
             * Prices come from the locked product rows, never from the cart:
             * `cart_items.unit_price_minor` is a working value that may be
             * minutes old, and the customer is charged today's price.
             */
            $subtotal = (int) $items->sum(
                fn (CartItem $item): int => $products[$item->product_id]->price_minor * $item->quantity,
            );

            $totals = OrderTotals::forSubtotal($subtotal, $cart->currency);

            $order = Order::query()->create([
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $userId,
                'customer_name' => $details['customer_name'],
                'customer_email' => $details['customer_email'],
                'customer_phone' => $details['customer_phone'] ?? null,
                'postal_code' => $details['postal_code'],
                'prefecture' => $details['prefecture'],
                'city' => $details['city'],
                'address_line1' => $details['address_line1'],
                'address_line2' => $details['address_line2'] ?? null,
                'subtotal_minor' => $totals->subtotalMinor,
                'shipping_minor' => $totals->shippingMinor,
                'tax_minor' => $totals->taxMinor,
                'total_minor' => $totals->totalMinor(),
                'currency' => $totals->currency,
                'notes' => $this->notes($details),
            ]);

            foreach ($items as $item) {
                $product = $products[$item->product_id];

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name_snapshot' => $product->name,
                    'sku_snapshot' => $product->sku,
                    'unit_price_minor' => $product->price_minor,
                    'quantity' => $item->quantity,
                    'line_total_minor' => $product->price_minor * $item->quantity,
                ]);

                $product->decrement('stock_quantity', $item->quantity);
            }

            $cart->items()->delete();

            return $order;
        });
    }

    /**
     * The chosen payment method is recorded in the order notes rather than in
     * a column of its own: §6 defines no payment column, and a stub choice is
     * not a payment record. It becomes a real field when a gateway lands.
     *
     * @param  array<string, mixed>  $details
     */
    private function notes(array $details): string
    {
        $method = __('orders.payment_method.'.$details['payment_method']);
        $lines = [__('orders.payment_recorded', ['method' => $method])];

        if (filled($details['notes'] ?? null)) {
            $lines[] = (string) $details['notes'];
        }

        return implode("\n", $lines);
    }
}
