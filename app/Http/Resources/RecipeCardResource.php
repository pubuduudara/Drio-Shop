<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Recipe;
use App\Support\MediaPresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Recipe
 */
class RecipeCardResource extends JsonResource
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
            'totalMinutes' => $this->totalMinutes(),
            'serves' => $this->serves,
            'media' => MediaPresenter::first($this->resource, 'primary', $this->title),
        ];
    }
}
