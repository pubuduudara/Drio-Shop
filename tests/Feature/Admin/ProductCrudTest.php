<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * Product management (§8) — the client's core need.
 */
beforeEach(function (): void {
    $this->admin = User::factory()->create(['is_admin' => true]);
    $this->category = Category::factory()->create([
        'name' => ['en' => 'Dehydrated Vegetables'],
        'slug' => 'dehydrated-vegetables',
    ]);
});

function productPayload(array $overrides = []): array
{
    return array_merge([
        'name' => ['en' => 'Dehydrated Jackfruit'],
        'short_description' => ['en' => 'Sun-dried, ready for the pot.'],
        'description' => ['en' => 'A longer description.'],
        'category_id' => test()->category->id,
        'slug' => 'dehydrated-jackfruit',
        'sku' => 'DRIO-JF-200',
        'price_minor' => 1580,
        'compare_at_price_minor' => null,
        'currency' => 'JPY',
        'weight_grams' => 200,
        'stock_quantity' => 40,
        'is_active' => true,
        'is_best_seller' => true,
        'is_vegetarian' => true,
        'sort_order' => 0,
    ], $overrides);
}

it('lists products with search and filters applied', function (): void {
    Product::factory()->create([
        'category_id' => $this->category->id,
        'name' => ['en' => 'Dehydrated Jackfruit'],
        'sku' => 'DRIO-JF-200',
        'is_active' => true,
    ]);
    Product::factory()->create([
        'category_id' => $this->category->id,
        'name' => ['en' => 'Chilli Powder'],
        'sku' => 'DRIO-CP-100',
        'is_active' => false,
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.products.index', ['search' => 'Jackfruit']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/products/index')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Dehydrated Jackfruit')
            ->where('filters.search', 'Jackfruit')
        );

    $this->actingAs($this->admin)
        ->get(route('admin.products.index', ['status' => 'inactive']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Chilli Powder')
        );
});

it('creates a product and stores translatable fields as locale-keyed json', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.products.store'), productPayload())
        ->assertRedirect();

    $product = Product::query()->firstOrFail();

    expect($product->name)->toBe('Dehydrated Jackfruit')
        ->and($product->getTranslations('name'))->toBe(['en' => 'Dehydrated Jackfruit'])
        ->and($product->price_minor)->toBe(1580);
});

it('derives the slug from the default-locale name when none is given', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.products.store'), productPayload(['slug' => '']))
        ->assertRedirect();

    expect(Product::query()->firstOrFail()->slug)->toBe('dehydrated-jackfruit');
});

it('rejects a product with no name in the default locale', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.products.store'), productPayload(['name' => ['en' => '']]))
        ->assertSessionHasErrors('name.en');

    expect(Product::query()->count())->toBe(0);
});

it('rejects a compare-at price that is not above the price', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.products.store'), productPayload([
            'price_minor' => 1580,
            'compare_at_price_minor' => 1000,
        ]))
        ->assertSessionHasErrors('compare_at_price_minor');
});

it('rejects a duplicate sku but allows a product to keep its own', function (): void {
    $existing = Product::factory()->create([
        'category_id' => $this->category->id,
        'sku' => 'DRIO-JF-200',
    ]);

    $this->actingAs($this->admin)
        ->post(route('admin.products.store'), productPayload())
        ->assertSessionHasErrors('sku');

    $this->actingAs($this->admin)
        ->put(route('admin.products.update', $existing), productPayload([
            'slug' => $existing->slug,
            'sku' => 'DRIO-JF-200',
        ]))
        ->assertSessionHasNoErrors();
});

it('hands the edit form the full translation map rather than a resolved string', function (): void {
    $product = Product::factory()->create([
        'category_id' => $this->category->id,
        'name' => ['en' => 'Dehydrated Jackfruit'],
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.products.edit', $product))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/products/edit')
            ->where('product.name', ['en' => 'Dehydrated Jackfruit'])
        );
});

it('updates a product', function (): void {
    $product = Product::factory()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)
        ->put(route('admin.products.update', $product), productPayload([
            'price_minor' => 1980,
        ]))
        ->assertRedirect();

    expect($product->refresh()->price_minor)->toBe(1980);
});

it('quick-edits price and stock from the table row', function (): void {
    $product = Product::factory()->create([
        'category_id' => $this->category->id,
        'price_minor' => 1580,
        'stock_quantity' => 40,
    ]);

    $this->actingAs($this->admin)
        ->patch(route('admin.products.quick-update', $product), [
            'price_minor' => 1680,
            'stock_quantity' => 12,
        ])
        ->assertRedirect();

    $product->refresh();

    expect($product->price_minor)->toBe(1680)
        ->and($product->stock_quantity)->toBe(12);
});

it('applies bulk activate, deactivate and delete', function (): void {
    $products = Product::factory()->count(3)->create([
        'category_id' => $this->category->id,
        'is_active' => true,
    ]);

    $ids = $products->pluck('id')->all();

    $this->actingAs($this->admin)
        ->patch(route('admin.products.bulk'), ['action' => 'deactivate', 'ids' => $ids]);

    expect(Product::query()->where('is_active', true)->count())->toBe(0);

    $this->actingAs($this->admin)
        ->patch(route('admin.products.bulk'), ['action' => 'activate', 'ids' => $ids]);

    expect(Product::query()->where('is_active', true)->count())->toBe(3);

    $this->actingAs($this->admin)
        ->patch(route('admin.products.bulk'), ['action' => 'delete', 'ids' => $ids]);

    expect(Product::query()->count())->toBe(0)
        ->and(Product::withTrashed()->count())->toBe(3);
});

it('soft-deletes a product so a mis-click is recoverable', function (): void {
    $product = Product::factory()->create(['category_id' => $this->category->id]);

    $this->actingAs($this->admin)
        ->delete(route('admin.products.destroy', $product))
        ->assertRedirect(route('admin.products.index'));

    expect(Product::query()->count())->toBe(0)
        ->and(Product::withTrashed()->count())->toBe(1);
});

it('keeps a non-admin out of every product endpoint', function (): void {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.products.index'))->assertForbidden();
    $this->actingAs($user)->post(route('admin.products.store'), productPayload())->assertForbidden();
});
