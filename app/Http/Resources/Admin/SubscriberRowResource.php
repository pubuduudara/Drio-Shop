<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\Subscriber;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One row of the subscribers table (§8).
 *
 * @mixin Subscriber
 */
class SubscriberRowResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'locale' => $this->locale,
            'confirmedAt' => $this->confirmed_at?->toDateString(),
            'subscribedAt' => $this->created_at?->toDateString(),
        ];
    }
}
