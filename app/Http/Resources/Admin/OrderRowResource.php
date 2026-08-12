<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One row of the admin orders table (§8).
 *
 * @mixin Order
 */
class OrderRowResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'customerName' => $this->customer_name,
            'customerEmail' => $this->customer_email,
            'status' => $this->status->value,
            'itemCount' => (int) ($this->items_sum_quantity ?? 0),
            'totalMinor' => $this->total_minor,
            'currency' => $this->currency,
            'placedAt' => $this->created_at?->toDateTimeString(),
        ];
    }
}
