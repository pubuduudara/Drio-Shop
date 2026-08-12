<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Review;
use Inertia\Testing\AssertableInertia;

/**
 * The shop, a category page and product detail (§7.12).
 */
beforeEach(function (): void {
    $this->vegetables = Category::factory()->create([
        'name' => ['en' => 'Dehydrated Vegetables'],
        'slug' => 'dehydrated-vegetables',
    ]);

    $this->spices = Category::factory()->create([
        'name' => ['en' => 'Curry Powder'],
        'slug' => 'curry-powder',
    ]);

    $this->jackfruit = Product::factory()->create([
        'category_id' => $this->vegetables->id,
        'name' => ['en' => 'Dehydrated Jackfruit'],
        'slug' => 'dehydrated-jackfruit',
        'price_minor' => 1580,
        'is_vegetarian' => true,
        'sort_order' => 0,
    ]);

    $this->curry = Product::factory()->create([
        'category_id' => $this->spices->id,
        'name' => ['en' => 'Roasted Curry Powder'],
        'slug' => 'roasted-curry-powder',
        'price_minor' => 980,
        'is_vegetarian' => false,
        'sort_order' => 1,
    ]);
});

it('lists the active catalogue', function (): void {
    Product::factory()->create([
        'category_id' => $this->vegetables->id,
        'is_active' => false,
    ]);

    $this->get(route('shop'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/shop/index')
            ->has('products.data', 2)
            ->has('categories', 2)
            ->where('products.meta.total', 2)
        );
});

it('filters by category, price and diet', function (): void {
    $this->get(route('shop', ['category' => 'curry-powder']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.slug', 'roasted-curry-powder')
        );

    $this->get(route('shop', ['min' => 1000]))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.slug', 'dehydrated-jackfruit')
        );

    $this->get(route('shop', ['dietary' => 'vegetarian']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.slug', 'dehydrated-jackfruit')
        );
});

it('searches across the translatable name column', function (): void {
    $this->get(route('shop', ['q' => 'Jackfruit']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.slug', 'dehydrated-jackfruit')
            ->where('filters.q', 'Jackfruit')
        );
});

it('sorts by price in both directions', function (): void {
    $this->get(route('shop', ['sort' => 'price_asc']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('products.data.0.slug', 'roasted-curry-powder')
        );

    $this->get(route('shop', ['sort' => 'price_desc']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('products.data.0.slug', 'dehydrated-jackfruit')
        );
});

it('rejects a sort it does not offer rather than passing it to the query', function (): void {
    $this->get(route('shop', ['sort' => 'price_minor; drop table products']))
        ->assertSessionHasErrors('sort');
});

it('paginates', function (): void {
    Product::factory()->count(15)->create(['category_id' => $this->vegetables->id]);

    $this->get(route('shop'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('products.data', 12)
            ->where('products.meta.lastPage', 2)
            ->where('products.links.next', fn (?string $url) => $url !== null)
        );
});

it('scopes a category page to its own category', function (): void {
    $this->get(route('categories.show', $this->spices))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/shop/category')
            ->where('category.slug', 'curry-powder')
            ->has('products.data', 1)
            ->where('products.data.0.slug', 'roasted-curry-powder')
        );
});

it('renders a product with its gallery, reviews and related products', function (): void {
    Review::factory()->count(2)->create([
        'product_id' => $this->jackfruit->id,
        'rating' => 5,
        'is_published' => true,
    ]);

    $sibling = Product::factory()->create([
        'category_id' => $this->vegetables->id,
        'name' => ['en' => 'Dehydrated Breadfruit Chips'],
    ]);

    $recipe = Recipe::factory()->create(['title' => ['en' => 'Jackfruit Curry']]);
    $recipe->products()->attach($this->jackfruit);

    $this->get(route('products.show', $this->jackfruit))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/products/show')
            ->where('product.name', 'Dehydrated Jackfruit')
            ->where('product.rating', fn (int|float $rating) => (float) $rating === 5.0)
            ->where('product.reviewsCount', 2)
            // A slot is reserved even with no upload, so the placeholder holds
            // the layout and swapping in a photo shifts nothing (§3).
            ->has('product.gallery', 1)
            ->has('reviews', 2)
            ->has('related', 1)
            ->where('related.0.slug', $sibling->slug)
            ->has('recipes', 1)
        );
});

it('does not serve an inactive product', function (): void {
    $this->jackfruit->update(['is_active' => false]);

    $this->get(route('products.show', $this->jackfruit))->assertNotFound();
});

it('keeps unpublished reviews off the product page', function (): void {
    Review::factory()->create([
        'product_id' => $this->jackfruit->id,
        'is_published' => false,
    ]);

    $this->get(route('products.show', $this->jackfruit))
        ->assertInertia(fn (AssertableInertia $page) => $page->has('reviews', 0));
});
