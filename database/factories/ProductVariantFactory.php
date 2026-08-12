<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Support\Locales;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $grams = $this->faker->randomElement([100, 200, 500]);

        return [
            'product_id' => Product::factory(),
            'name' => [Locales::default() => "{$grams}g"],
            'sku' => Str::upper('DRIO-V-'.$this->faker->unique()->bothify('??##')),
            'price_minor' => $this->faker->numberBetween(6, 25) * 100,
            'stock_quantity' => $this->faker->numberBetween(0, 80),
        ];
    }
}
