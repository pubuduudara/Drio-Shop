<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\Product;
use App\Support\MediaPresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One row of the admin products table (§8).
 *
 * Translatable fields resolve to plain strings here exactly as they do on the
 * storefront — the table shows the console operator's language, not raw
 * translation JSON. Only the edit form receives the full array (§9.4).
 *
 * @mixin Product
 */
class ProductRowResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'categoryName' => $this->whenLoaded('category', fn (): string => $this->category->name),
            'priceMinor' => $this->price_minor,
            'compareAtPriceMinor' => $this->compare_at_price_minor,
            'currency' => $this->currency,
            'stockQuantity' => $this->stock_quantity,
            'isLowStock' => $this->isLowStock(),
            'isActive' => $this->is_active,
            'isBestSeller' => $this->is_best_seller,
            'media' => ($primary = $this->resource->primaryImage())
                ? MediaPresenter::forMedia($primary, $this->name)
                : null,
        ];
    }
}
