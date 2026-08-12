<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One row of the moderation queue (§8).
 *
 * The body arrives resolved to the active locale, like every other storefront
 * and console list. The queue approves, features and deletes — it does not
 * edit copy — so it gets no raw translation map; §9.4 reserves that for the
 * admin edit form and nothing else.
 *
 * @mixin Review
 */
class ReviewRowResource extends JsonResource
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
            'isPublished' => $this->is_published,
            'isFeatured' => $this->is_featured,
            'productId' => $this->product_id,
            'productName' => $this->whenLoaded('product', fn (): ?string => $this->product?->name),
            'submittedAt' => $this->created_at?->toDateString(),
        ];
    }
}
