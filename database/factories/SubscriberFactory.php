<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Subscriber;
use App\Support\Locales;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscriber>
 */
class SubscriberFactory extends Factory
{
    protected $model = Subscriber::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => $this->faker->unique()->safeEmail(),
            'locale' => Locales::default(),
            'confirmed_at' => now(),
        ];
    }

    public function unconfirmed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'confirmed_at' => null,
        ]);
    }
}
