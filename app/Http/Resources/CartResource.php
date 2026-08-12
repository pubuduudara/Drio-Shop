<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Cart;
use App\Models\CartItem;
use App\Support\MediaPresenter;
use App\Support\OrderTotals;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The cart as the header badge, the drawer, the cart page and the checkout
 * review step all read it — one shape, so those four cannot disagree about
 * what is in the basket or what it costs.
 *
 * @mixin Cart
 */
class CartResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $totals = OrderTotals::forCart($this->resource);

        return [
            'lines' => $this->items->map(fn (CartItem $item): array => [
                'id' => $item->id,
                'productId' => $item->product_id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'unitPriceMinor' => $item->unit_price_minor,
                'lineTotalMinor' => $item->lineTotalMinor(),
                'quantity' => $item->quantity,
                /*
                 * The shelf, not the basket: a line already holding four of a
                 * product with four left must not offer a fifth.
                 */
                'stockQuantity' => $item->product->stock_quantity,
                'media' => ($primary = $item->product->primaryImage())
                    ? MediaPresenter::forMedia($primary, $item->product->name)
                    : null,
            ])->all(),

            'count' => (int) $this->items->sum('quantity'),
            'totals' => $totals->toArray(),
        ];
    }

    /**
     * The shape a visitor with no cart row gets. Shared rather than null, so
     * no component has to guard the prop before reading `count`.
     *
     * @return array<string, mixed>
     */
    public static function empty(): array
    {
        return [
            'lines' => [],
            'count' => 0,
            'totals' => OrderTotals::forCart(null)->toArray(),
        ];
    }
}
