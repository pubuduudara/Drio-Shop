<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\Recipe;
use Inertia\Testing\AssertableInertia;

/**
 * Recipe index and detail (§7.12).
 */
it('lists published recipes only', function (): void {
    Recipe::factory()->create(['title' => ['en' => 'Jackfruit Curry']]);
    Recipe::factory()->create([
        'title' => ['en' => 'Draft Curry'],
        'is_published' => false,
    ]);

    $this->get(route('recipes.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/recipes/index')
            ->has('recipes.data', 1)
            ->where('recipes.data.0.title', 'Jackfruit Curry')
            ->where('filters.diet', null)
        );
});

it('filters the index by diet', function (): void {
    Recipe::factory()->create([
        'title' => ['en' => 'Polos Curry'],
        'is_vegetarian' => true,
    ]);
    Recipe::factory()->create([
        'title' => ['en' => 'Fish Ambul Thiyal'],
        'is_vegetarian' => false,
    ]);

    $this->get(route('recipes.index', ['diet' => 'vegetarian']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('recipes.data', 1)
            ->where('recipes.data.0.title', 'Polos Curry')
        );

    $this->get(route('recipes.index', ['diet' => 'non-vegetarian']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('recipes.data', 1)
            ->where('recipes.data.0.title', 'Fish Ambul Thiyal')
        );
});

it('rejects a diet it does not offer', function (): void {
    $this->get(route('recipes.index', ['diet' => 'carnivore']))
        ->assertSessionHasErrors('diet');
});

it('serves a recipe with its steps and the products to shop', function (): void {
    $recipe = Recipe::factory()->create([
        'title' => ['en' => 'Jackfruit Curry'],
        'ingredients' => ['en' => ['200g dehydrated jackfruit', '1 tbsp curry powder']],
        'steps' => ['en' => ['Soak the jackfruit.', 'Temper the spices.']],
    ]);

    $product = Product::factory()->create(['name' => ['en' => 'Dehydrated Jackfruit']]);
    // An inactive product must not be offered for sale from a recipe.
    $hidden = Product::factory()->create(['is_active' => false]);

    $recipe->products()->attach([$product->id, $hidden->id]);

    $this->get(route('recipes.show', $recipe))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/recipes/show')
            ->where('recipe.title', 'Jackfruit Curry')
            ->has('recipe.ingredients', 2)
            ->has('recipe.steps', 2)
            ->has('recipe.products', 1)
            ->where('recipe.products.0.name', 'Dehydrated Jackfruit')
        );
});

it('does not serve an unpublished recipe', function (): void {
    $recipe = Recipe::factory()->create(['is_published' => false]);

    $this->get(route('recipes.show', $recipe))->assertNotFound();
});
