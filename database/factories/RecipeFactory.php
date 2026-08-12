<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Recipe;
use App\Support\Locales;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Recipe>
 */
class RecipeFactory extends Factory
{
    protected $model = Recipe::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = Str::title($this->faker->unique()->word().' '.$this->faker->word()).' Curry';
        $locale = Locales::default();

        return [
            'title' => [$locale => $title],
            'slug' => Str::slug($title),
            'intro' => [$locale => $this->faker->sentence()],
            // Translatable lists: the locale key holds an array, so a
            // translation may legitimately differ in length.
            'ingredients' => [$locale => $this->faker->sentences(5)],
            'steps' => [$locale => $this->faker->sentences(4)],
            'prep_minutes' => $this->faker->numberBetween(5, 25),
            'cook_minutes' => $this->faker->numberBetween(15, 60),
            'serves' => $this->faker->numberBetween(2, 6),
            'is_vegetarian' => true,
            'is_traditional' => false,
            'is_quick' => false,
            'is_published' => true,
            'sort_order' => 0,
        ];
    }

    public function traditional(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_traditional' => true,
        ]);
    }

    public function quick(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_quick' => true,
            'cook_minutes' => $this->faker->numberBetween(10, 20),
        ]);
    }

    public function unpublished(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_published' => false,
        ]);
    }
}
