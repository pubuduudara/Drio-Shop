<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Product;
use App\Support\MediaPresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * A product as its detail page needs it (§7.12) — everything the card carries
 * plus the gallery, the long description and the shipping-relevant details.
 *
 * Translatable fields are already resolved to plain strings, as everywhere on
 * the storefront (§9.4).
 *
 * @mixin Product
 */
class ProductDetailResource extends JsonResource
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
            'description' => $this->description,
            'sku' => $this->sku,
            'priceMinor' => $this->price_minor,
            'compareAtPriceMinor' => $this->compare_at_price_minor,
            'currency' => $this->currency,
            'weightGrams' => $this->weight_grams,
            'stockQuantity' => $this->stock_quantity,
            'isInStock' => $this->isInStock(),
            'isLowStock' => $this->isLowStock(),
            'isVegetarian' => $this->is_vegetarian,
            'rating' => round((float) ($this->reviews_avg_rating ?? 0), 1),
            'reviewsCount' => (int) ($this->reviews_count ?? 0),

            'category' => $this->whenLoaded('category', fn (): array => [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),

            /*
             * The gallery, with the primary image first. The card and the
             * detail hero must agree on which shot leads, and the `primary`
             * collection is the record of that choice (§6).
             */
            'gallery' => $this->gallery(),
        ];
    }

    /**
     * @return list<array<string, mixed>|null>
     */
    private function gallery(): array
    {
        $primaryMedia = $this->resource->primaryImage();
        $primary = $primaryMedia ? MediaPresenter::forMedia($primaryMedia, $this->name) : null;

        $gallery = $this->getMedia('gallery')
            ->map(fn (Media $media): array => [
                'url' => $media->getUrl(),
                'srcset' => $media->getSrcset() === '' ? null : $media->getSrcset(),
                'alt' => $this->name,
                'width' => null,
                'height' => null,
            ])
            ->all();

        if ($primary !== null) {
            // Drop the gallery copy of the primary so it is not shown twice.
            $gallery = array_values(array_filter(
                $gallery,
                fn (array $item): bool => $item['url'] !== $primary['url'],
            ));

            array_unshift($gallery, $primary);
        }

        /*
         * An empty list still means one slot: `<Media />` renders the labelled
         * placeholder, and the page reserves the same aspect ratio either way
         * so swapping in photography causes no layout shift (§3, §11).
         */
        return $gallery === [] ? [null] : $gallery;
    }
}
