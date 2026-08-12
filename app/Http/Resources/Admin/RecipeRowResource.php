<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One row of the admin recipes table (§8).
 *
 * @mixin Recipe
 */
class RecipeRowResource extends JsonResource
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
            'totalMinutes' => $this->totalMinutes(),
            'serves' => $this->serves,
            'isPublished' => $this->is_published,
            'isVegetarian' => $this->is_vegetarian,
            'isTraditional' => $this->is_traditional,
            'isQuick' => $this->is_quick,
            'productsCount' => (int) ($this->products_count ?? 0),
        ];
    }
}
