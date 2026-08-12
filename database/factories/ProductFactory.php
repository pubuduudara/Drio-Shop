<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Support\Locales;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(
            $this->faker->unique()->word().' '.$this->faker->word().' '.$this->faker->word(),
        );
        $locale = Locales::default();

        return [
            'category_id' => Category::factory(),
            'name' => [$locale => $name],
            'slug' => Str::slug($name),
            'short_description' => [$locale => $this->faker->sentence()],
            'description' => [$locale => $this->faker->paragraphs(2, true)],
            'sku' => Str::upper('DRIO-'.$this->faker->unique()->bothify('??##')),
            // Whole hundreds of yen: JPY has no minor unit, so these integers
            // are the displayed amount (§2).
            'price_minor' => $this->faker->numberBetween(6, 25) * 100,
            'compare_at_price_minor' => null,
            'currency' => 'JPY',
            'weight_grams' => $this->faker->randomElement([100, 200, 250, 500]),
            'stock_quantity' => $this->faker->numberBetween(0, 120),
            'is_active' => true,
            'is_best_seller' => false,
            'is_vegetarian' => true,
            'sort_order' => 0,
        ];
    }

    public function bestSeller(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_best_seller' => true,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (array $attributes): array => [
            'stock_quantity' => 0,
        ]);
    }

    /** Exercises the low-stock warning on the admin dashboard (§8). */
    public function lowStock(): static
    {
        return $this->state(fn (array $attributes): array => [
            'stock_quantity' => $this->faker->numberBetween(1, Product::LOW_STOCK_THRESHOLD),
        ]);
    }

    /** Gives the product a struck-through was-price (§5.4). */
    public function onSale(): static
    {
        return $this->state(fn (array $attributes): array => [
            'compare_at_price_minor' => ($attributes['price_minor'] ?? 1000) + 400,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
