<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = $this->faker->numberBetween(1, 3);
        $unitPrice = $this->faker->numberBetween(6, 20) * 100;

        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'product_name_snapshot' => $this->faker->words(3, true),
            'sku_snapshot' => strtoupper($this->faker->bothify('DRIO-??##')),
            'unit_price_minor' => $unitPrice,
            'quantity' => $quantity,
            'line_total_minor' => $unitPrice * $quantity,
        ];
    }

    /**
     * Snapshots a real product, which is what checkout does — the line records
     * what the customer actually saw.
     */
    public function forProduct(Product $product, int $quantity = 1): static
    {
        return $this->state(fn (array $attributes): array => [
            'product_id' => $product->id,
            'product_name_snapshot' => $product->name,
            'sku_snapshot' => $product->sku,
            'unit_price_minor' => $product->price_minor,
            'quantity' => $quantity,
            'line_total_minor' => $product->price_minor * $quantity,
        ]);
    }
}
