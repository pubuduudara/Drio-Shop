<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Recipe;
use App\Support\Locales;
use Illuminate\Database\Seeder;

/**
 * The four recipes the mockup shows (§6), each linked to the products it uses
 * so the "shop the ingredients" block has something to sell (§7.12).
 */
class RecipeSeeder extends Seeder
{
    public function run(): void
    {
        $locale = Locales::default();

        foreach ($this->recipes() as $index => $recipe) {
            $model = Recipe::query()->updateOrCreate(
                ['slug' => $recipe['slug']],
                [
                    'title' => [$locale => $recipe['title']],
                    'intro' => [$locale => $recipe['intro']],
                    'ingredients' => [$locale => $recipe['ingredients']],
                    'steps' => [$locale => $recipe['steps']],
                    'prep_minutes' => $recipe['prep'],
                    'cook_minutes' => $recipe['cook'],
                    'serves' => $recipe['serves'],
                    'is_vegetarian' => $recipe['vegetarian'],
                    'is_traditional' => $recipe['traditional'],
                    'is_quick' => $recipe['quick'],
                    'is_published' => true,
                    'sort_order' => $index,
                ],
            );

            $productIds = Product::query()
                ->whereIn('slug', $recipe['products'])
                ->pluck('id');

            $model->products()->sync($productIds);
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function recipes(): array
    {
        return [
            [
                'slug' => 'jackfruit-curry',
                'title' => 'Jackfruit Curry',
                'intro' => 'The curry that converts people. Ripe-but-firm jackfruit takes on spice the way meat does, and a pack of dried jackfruit gets you there in under an hour.',
                'prep' => 15,
                'cook' => 35,
                'serves' => 4,
                'vegetarian' => true,
                'traditional' => true,
                'quick' => false,
                'products' => ['dehydrated-jackfruit', 'roasted-curry-powder', 'curry-leaves'],
                'ingredients' => [
                    '200g dehydrated jackfruit',
                    '2 tbsp roasted curry powder',
                    '1 tsp chilli powder',
                    '400ml coconut milk',
                    '1 onion, sliced thin',
                    '3 cloves garlic, crushed',
                    'A sprig of curry leaves',
                    'A piece of pandan leaf',
                    'Salt to taste',
                ],
                'steps' => [
                    'Soak the jackfruit in warm water for 20 minutes, then drain.',
                    'Heat oil and bloom the curry leaves and pandan until they crackle.',
                    'Add the onion and garlic and cook until soft and just golden.',
                    'Stir in the curry powder and chilli powder for thirty seconds, no longer.',
                    'Add the jackfruit and half the coconut milk. Simmer covered for 20 minutes.',
                    'Add the rest of the coconut milk, season, and simmer uncovered until it thickens.',
                ],
            ],
            [
                'slug' => 'polos-curry',
                'title' => 'Polos Curry',
                'intro' => 'Baby jackfruit cooked dark and rich. This is the one people mean when they talk about the food they miss.',
                'prep' => 20,
                'cook' => 45,
                'serves' => 4,
                'vegetarian' => true,
                'traditional' => true,
                'quick' => false,
                'products' => ['dehydrated-polos-jackfruit', 'roasted-curry-powder', 'goraka'],
                'ingredients' => [
                    '200g dehydrated polos jackfruit',
                    '2 tbsp roasted curry powder',
                    '2 pieces goraka',
                    '400ml thick coconut milk',
                    '1 onion, finely chopped',
                    '1 tsp turmeric',
                    'A sprig of curry leaves',
                    'Salt to taste',
                ],
                'steps' => [
                    'Soak the polos for 25 minutes in warm water, then drain well.',
                    'Soak the goraka separately in a little hot water.',
                    'Fry the onion and curry leaves until the onion is deeply golden.',
                    'Add the curry powder and turmeric and cook until it smells roasted.',
                    'Add the polos, goraka and its soaking water, and enough water to cover.',
                    'Simmer for 30 minutes, then add the coconut milk and reduce until thick and dark.',
                ],
            ],
            [
                'slug' => 'breadfruit-curry',
                'title' => 'Breadfruit Curry',
                'intro' => 'Mild, starchy and comforting — closer to a potato curry than anything else, and just as good the next day.',
                'prep' => 10,
                'cook' => 25,
                'serves' => 4,
                'vegetarian' => true,
                'traditional' => false,
                'quick' => true,
                'products' => ['dehydrated-breadfruit-chips', 'unroasted-curry-powder', 'pandan-leaves-rampe'],
                'ingredients' => [
                    '150g dehydrated breadfruit',
                    '1 tbsp unroasted curry powder',
                    '1/2 tsp turmeric',
                    '400ml coconut milk',
                    '1 onion, sliced',
                    '2 green chillies, split',
                    'A piece of pandan leaf',
                    'Salt to taste',
                ],
                'steps' => [
                    'Soak the breadfruit for 15 minutes and drain.',
                    'Put everything except the coconut milk in a pot with enough water to cover.',
                    'Boil until the breadfruit is tender, about 12 minutes.',
                    'Add the coconut milk and simmer gently — do not let it boil hard.',
                    'Season and take it off the heat while the pieces still hold their shape.',
                ],
            ],
            [
                'slug' => 'sri-lankan-rice-and-curry',
                'title' => 'Sri Lankan Rice & Curry',
                'intro' => 'Not one dish but a table: rice in the middle and several small curries around it. Build it from whatever you have.',
                'prep' => 30,
                'cook' => 60,
                'serves' => 6,
                'vegetarian' => true,
                'traditional' => true,
                'quick' => false,
                'products' => [
                    'roasted-curry-powder',
                    'chilli-powder',
                    'dehydrated-drumstick-leaves',
                    'curry-leaves',
                    'maldive-fish-flakes',
                ],
                'ingredients' => [
                    '2 cups red rice',
                    'One vegetable curry of your choice',
                    'A dhal curry',
                    'A mallum of drumstick leaves and fresh coconut',
                    'Coconut sambol',
                    'Papadam',
                ],
                'steps' => [
                    'Start the rice first — red rice takes longer than you expect.',
                    'Cook the dhal with turmeric and a tempering of onion and curry leaf.',
                    'Make the vegetable curry while the dhal simmers.',
                    'Toss the mallum together off the heat so the coconut stays fresh.',
                    'Pound the sambol with chilli, coconut, lime and a little maldive fish.',
                    'Fry the papadam last and serve everything at once.',
                ],
            ],
        ];
    }
}
