<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\Product;
use App\Support\Locales;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A product as its admin edit form needs it (§8).
 *
 * This is the one place in the application allowed to hand raw translation
 * arrays to the front end (§9.4): `<TranslatableField />` edits every locale at
 * once, so it needs the whole map rather than one resolved string.
 *
 * The array is normalised to hold a key for every enabled locale, so enabling
 * Japanese produces empty tabs to fill rather than undefined values to guard
 * against in the component.
 *
 * @mixin Product
 */
class ProductFormResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->translationsFor('name'),
            'shortDescription' => $this->translationsFor('short_description'),
            'description' => $this->translationsFor('description'),

            'slug' => $this->slug,
            'sku' => $this->sku,
            'categoryId' => $this->category_id,

            'priceMinor' => $this->price_minor,
            'compareAtPriceMinor' => $this->compare_at_price_minor,
            'currency' => $this->currency,

            'weightGrams' => $this->weight_grams,
            'stockQuantity' => $this->stock_quantity,
            'sortOrder' => $this->sort_order,

            'isActive' => $this->is_active,
            'isBestSeller' => $this->is_best_seller,
            'isVegetarian' => $this->is_vegetarian,

            'gallery' => MediaResource::collection($this->getMedia('gallery')),
            /*
             * The gallery row the primary was copied from, not its file name:
             * two uploads can share a name, and the Media tab would then mark
             * the wrong tile.
             */
            'primaryMediaId' => $this->primaryMediaId(),
        ];
    }

    private function primaryMediaId(): ?int
    {
        $id = $this->getMedia('primary')->first()?->getCustomProperty(Product::PRIMARY_SOURCE_PROPERTY);

        return is_numeric($id) ? (int) $id : null;
    }

    /**
     * @return array<string, string>
     */
    private function translationsFor(string $attribute): array
    {
        /** @var array<string, string> $stored */
        $stored = $this->getTranslations($attribute);
        $translations = [];

        foreach (Locales::enabled() as $locale) {
            $translations[$locale] = $stored[$locale] ?? '';
        }

        return $translations;
    }
}
