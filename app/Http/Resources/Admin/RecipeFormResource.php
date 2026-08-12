<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\Product;
use App\Models\Recipe;
use App\Support\Locales;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A recipe as its admin form needs it — full translation maps, per the §9.4
 * exception documented on ProductFormResource.
 *
 * @mixin Recipe
 */
class RecipeFormResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->translations('title'),
            'intro' => $this->translations('intro'),
            'ingredients' => $this->listTranslations('ingredients'),
            'steps' => $this->listTranslations('steps'),

            'slug' => $this->slug,
            'prepMinutes' => $this->prep_minutes,
            'cookMinutes' => $this->cook_minutes,
            'serves' => $this->serves,
            'sortOrder' => $this->sort_order,

            'isVegetarian' => $this->is_vegetarian,
            'isTraditional' => $this->is_traditional,
            'isQuick' => $this->is_quick,
            'isPublished' => $this->is_published,

            'productIds' => $this->whenLoaded(
                'products',
                fn () => $this->products->map(fn (Product $product): int => $product->id)->all(),
                [],
            ),
        ];
    }

    /**
     * @return array<string, string>
     */
    private function translations(string $attribute): array
    {
        /** @var array<string, string> $stored */
        $stored = $this->getTranslations($attribute);
        $out = [];

        foreach (Locales::enabled() as $locale) {
            $out[$locale] = $stored[$locale] ?? '';
        }

        return $out;
    }

    /**
     * A translatable list, normalised so every enabled locale holds an array.
     * The builder renders rows from it and cannot handle a missing key.
     *
     * @return array<string, list<string>>
     */
    private function listTranslations(string $attribute): array
    {
        /** @var array<string, list<string>> $stored */
        $stored = $this->getTranslations($attribute);
        $out = [];

        foreach (Locales::enabled() as $locale) {
            $out[$locale] = array_values((array) ($stored[$locale] ?? []));
        }

        return $out;
    }
}
