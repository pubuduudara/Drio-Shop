<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Review;
use App\Support\Locales;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Null by default: the homepage testimonials are about the brand,
            // not a product (§6). Use `forProduct()` for product feedback.
            'product_id' => null,
            'customer_name' => $this->faker->firstName(),
            'customer_city' => $this->faker->randomElement([
                'Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Fukuoka', 'Kobe', 'Kyoto',
            ]),
            'rating' => $this->faker->numberBetween(4, 5),
            'body' => [Locales::default() => $this->faker->sentences(2, true)],
            'is_published' => true,
            'is_featured' => false,
        ];
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_featured' => true,
            'is_published' => true,
        ]);
    }

    public function unpublished(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_published' => false,
        ]);
    }
}
