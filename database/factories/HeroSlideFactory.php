<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\HeroSlide;
use App\Support\Locales;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HeroSlide>
 */
class HeroSlideFactory extends Factory
{
    protected $model = HeroSlide::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $locale = Locales::default();

        return [
            'headline' => [$locale => $this->faker->sentence(4)],
            'subhead' => [$locale => $this->faker->sentence(10)],
            'primary_cta_label' => [$locale => 'Shop Now'],
            'primary_cta_href' => '/shop',
            'secondary_cta_label' => [$locale => 'Explore Products'],
            'secondary_cta_href' => '/shop',
            'sort_order' => 0,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
