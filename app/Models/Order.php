<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\OrderStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $order_number
 * @property int|null $user_id
 * @property OrderStatus $status
 * @property string $customer_name
 * @property string $customer_email
 * @property string|null $customer_phone
 * @property string $postal_code
 * @property string $prefecture
 * @property string $city
 * @property string $address_line1
 * @property string|null $address_line2
 * @property int $subtotal_minor
 * @property int $shipping_minor
 * @property int $tax_minor
 * @property int $total_minor
 * @property string $currency
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'order_number', 'user_id', 'status', 'customer_name', 'customer_email',
    'customer_phone', 'postal_code', 'prefecture', 'city', 'address_line1',
    'address_line2', 'subtotal_minor', 'shipping_minor', 'tax_minor',
    'total_minor', 'currency', 'notes',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    public function getRouteKeyName(): string
    {
        return 'order_number';
    }

    /**
     * A human-quotable reference. Date-prefixed so support can place an order
     * in time without a lookup, with random tail rather than a sequence so it
     * leaks no volume information.
     */
    public static function generateOrderNumber(): string
    {
        return 'DRIO-'.now()->format('Ymd').'-'.Str::upper(Str::random(5));
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @param  Builder<$this>  $query
     */
    #[Scope]
    protected function withStatus(Builder $query, OrderStatus $status): void
    {
        $query->where('status', $status);
    }

    /**
     * Orders that count towards revenue on the dashboard (§8).
     *
     * @param  Builder<$this>  $query
     */
    #[Scope]
    protected function paid(Builder $query): void
    {
        $query->whereIn('status', array_map(
            fn (OrderStatus $status): string => $status->value,
            array_filter(
                OrderStatus::cases(),
                fn (OrderStatus $status): bool => $status->isPaid(),
            ),
        ));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'subtotal_minor' => 'integer',
            'shipping_minor' => 'integer',
            'tax_minor' => 'integer',
            'total_minor' => 'integer',
        ];
    }
}
