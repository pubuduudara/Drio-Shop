<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CartItem>
 */
class CartItemFactory extends Factory
{
    protected $model = CartItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cart_id' => Cart::factory(),
            'product_id' => Product::factory(),
            'quantity' => $this->faker->numberBetween(1, 3),
            'unit_price_minor' => $this->faker->numberBetween(6, 20) * 100,
        ];
    }

    public function forProduct(Product $product, int $quantity = 1): static
    {
        return $this->state(fn (array $attributes): array => [
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price_minor' => $product->price_minor,
        ]);
    }
}
