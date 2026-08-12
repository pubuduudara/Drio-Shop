<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Review;
use App\Support\MediaPresenter;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Review
 */
class ReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customerName' => $this->customer_name,
            'customerCity' => $this->customer_city,
            'rating' => $this->rating,
            'body' => $this->body,
            'avatar' => MediaPresenter::first(
                $this->resource,
                'avatar',
                $this->customer_name,
            ),
        ];
    }
}
