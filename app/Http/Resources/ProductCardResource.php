<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Product;
use App\Support\MediaPresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A product as the card components need it (§7.4).
 *
 * Every translatable field is already resolved to a plain string here, so React
 * receives `name` as text and is entirely unaware translation exists (§9.4).
 *
 * `rating` and `reviewsCount` come from `withAvg`/`withCount` on the query —
 * this resource never issues its own, so a grid of twenty cards is still two
 * queries rather than forty.
 *
 * @mixin Product
 */
class ProductCardResource extends JsonResource
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
            'shortDescription' => $this->short_description,
            'priceMinor' => $this->price_minor,
            'compareAtPriceMinor' => $this->compare_at_price_minor,
            'currency' => $this->currency,
            'rating' => round((float) ($this->reviews_avg_rating ?? 0), 1),
            'reviewsCount' => (int) ($this->reviews_count ?? 0),
            'isInStock' => $this->isInStock(),
            'isVegetarian' => $this->is_vegetarian,
            'media' => ($primary = $this->resource->primaryImage())
                ? MediaPresenter::forMedia($primary, $this->name)
                : null,
        ];
    }
}
