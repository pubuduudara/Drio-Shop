<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A purchased line, snapshotted at checkout (§6).
 *
 * @property int $id
 * @property int $order_id
 * @property int|null $product_id
 * @property string $product_name_snapshot
 * @property string $sku_snapshot
 * @property int $unit_price_minor
 * @property int $quantity
 * @property int $line_total_minor
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'order_id', 'product_id', 'product_name_snapshot', 'sku_snapshot',
    'unit_price_minor', 'quantity', 'line_total_minor',
])]
class OrderItem extends Model
{
    /** @use HasFactory<OrderItemFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Nullable: the catalogue entry may since have been deleted, but the line
     * still reads correctly from its snapshot.
     *
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit_price_minor' => 'integer',
            'quantity' => 'integer',
            'line_total_minor' => 'integer',
        ];
    }
}
