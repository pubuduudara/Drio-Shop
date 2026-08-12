<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use App\Support\Locales;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    /**
     * Translatable attributes are seeded under the default locale key only
     * (§6). `Locales::default()` rather than a literal, so a project that
     * changes its default locale does not need its factories rewritten.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // `word()` is typed as a string, unlike `words()` which the faker stub
        // types as array|string regardless of the $asText argument.
        $name = Str::title($this->faker->unique()->word().' '.$this->faker->word());

        return [
            'name' => [Locales::default() => $name],
            'slug' => Str::slug($name),
            'description' => [Locales::default() => $this->faker->sentence()],
            'icon_key' => $this->faker->randomElement(['leaf', 'powder', 'chilli', 'spice']),
            'sort_order' => 0,
            'is_featured' => false,
        ];
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_featured' => true,
        ]);
    }
}
