<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\Category;
use App\Support\Locales;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A category as its admin edit form needs it — full translation maps, per the
 * §9.4 exception documented on ProductFormResource.
 *
 * @mixin Category
 */
class CategoryFormResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->translationsFor('name'),
            'description' => $this->translationsFor('description'),
            'slug' => $this->slug,
            'iconKey' => $this->icon_key,
            'isFeatured' => $this->is_featured,
            'sortOrder' => $this->sort_order,
        ];
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
