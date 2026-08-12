<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Recipe;
use App\Support\MediaPresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A recipe as its detail page needs it (§7.12), including the products it uses
 * so the page can offer a "shop the ingredients" block.
 *
 * @mixin Recipe
 */
class RecipeDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'intro' => $this->intro,
            // Translatable lists: Translatable resolves the locale, so these
            // arrive as plain arrays of strings (§9.4).
            'ingredients' => $this->ingredients ?? [],
            'steps' => $this->steps ?? [],
            'prepMinutes' => $this->prep_minutes,
            'cookMinutes' => $this->cook_minutes,
            'totalMinutes' => $this->totalMinutes(),
            'serves' => $this->serves,
            'isVegetarian' => $this->is_vegetarian,
            'isTraditional' => $this->is_traditional,
            'isQuick' => $this->is_quick,
            'media' => MediaPresenter::first($this->resource, 'primary', $this->title),
            'products' => ProductCardResource::collection(
                $this->whenLoaded('products'),
            ),
        ];
    }
}
