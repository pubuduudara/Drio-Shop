<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An order as the confirmation page and the admin detail view read it (§7.12,
 * §8).
 *
 * Line values come from the snapshots on `order_items`, never from the live
 * product — the record of what was bought must not change when a product is
 * renamed, repriced or deleted.
 *
 * @mixin Order
 */
class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'status' => $this->status->value,

            'customer' => [
                'name' => $this->customer_name,
                'email' => $this->customer_email,
                'phone' => $this->customer_phone,
            ],

            'shippingAddress' => [
                'postalCode' => $this->postal_code,
                'prefecture' => $this->prefecture,
                'city' => $this->city,
                'addressLine1' => $this->address_line1,
                'addressLine2' => $this->address_line2,
            ],

            'totals' => [
                'subtotalMinor' => $this->subtotal_minor,
                'shippingMinor' => $this->shipping_minor,
                'taxMinor' => $this->tax_minor,
                'totalMinor' => $this->total_minor,
                'currency' => $this->currency,
            ],

            'items' => $this->whenLoaded(
                'items',
                fn () => $this->items->map(fn (OrderItem $item): array => [
                    'id' => $item->id,
                    'productId' => $item->product_id,
                    'name' => $item->product_name_snapshot,
                    'sku' => $item->sku_snapshot,
                    'unitPriceMinor' => $item->unit_price_minor,
                    'quantity' => $item->quantity,
                    'lineTotalMinor' => $item->line_total_minor,
                ])->all(),
            ),

            'notes' => $this->notes,
            'placedAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
