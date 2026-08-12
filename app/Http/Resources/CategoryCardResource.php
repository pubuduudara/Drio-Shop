<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Category;
use App\Support\MediaPresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Category
 */
class CategoryCardResource extends JsonResource
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
            'description' => $this->description,
            // The key of a drawn SVG component, not a path to an asset (§3).
            'iconKey' => $this->icon_key,
            'media' => MediaPresenter::first($this->resource, 'primary', $this->name),
        ];
    }
}
