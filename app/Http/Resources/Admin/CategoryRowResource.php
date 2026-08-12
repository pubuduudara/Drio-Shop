<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One row of the admin categories list (§8).
 *
 * @mixin Category
 */
class CategoryRowResource extends JsonResource
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
            'iconKey' => $this->icon_key,
            'isFeatured' => $this->is_featured,
            'sortOrder' => $this->sort_order,
            'productsCount' => (int) ($this->products_count ?? 0),
        ];
    }
}
