<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * Category management (§8): CRUD, reorder, icon picker, feature toggle.
 */
beforeEach(function (): void {
    $this->admin = User::factory()->create(['is_admin' => true]);
});

function categoryPayload(array $overrides = []): array
{
    return array_merge([
        'name' => ['en' => 'Curry Powder'],
        'description' => ['en' => 'Roasted and unroasted blends.'],
        'slug' => 'curry-powder',
        'icon_key' => 'powder',
        'is_featured' => true,
        'sort_order' => 1,
    ], $overrides);
}

it('lists categories with their product counts', function (): void {
    $category = Category::factory()->create(['name' => ['en' => 'Curry Powder']]);
    Product::factory()->count(2)->create(['category_id' => $category->id]);

    $this->actingAs($this->admin)
        ->get(route('admin.categories.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/categories/index')
            ->has('categories', 1)
            ->where('categories.0.name', 'Curry Powder')
            ->where('categories.0.productsCount', 2)
        );
});

it('creates a category', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.categories.store'), categoryPayload())
        ->assertRedirect(route('admin.categories.index'));

    $category = Category::query()->firstOrFail();

    expect($category->getTranslations('name'))->toBe(['en' => 'Curry Powder'])
        ->and($category->icon_key)->toBe('powder')
        ->and($category->is_featured)->toBeTrue();
});

it('rejects an icon key with no drawn glyph behind it', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.categories.store'), categoryPayload(['icon_key' => 'unicorn']))
        ->assertSessionHasErrors('icon_key');
});

it('updates a category', function (): void {
    $category = Category::factory()->create(['is_featured' => false]);

    $this->actingAs($this->admin)
        ->put(route('admin.categories.update', $category), categoryPayload([
            'slug' => $category->slug,
        ]))
        ->assertRedirect();

    expect($category->refresh()->is_featured)->toBeTrue();
});

it('reorders categories from the posted position rather than a client value', function (): void {
    $first = Category::factory()->create(['sort_order' => 0]);
    $second = Category::factory()->create(['sort_order' => 1]);
    $third = Category::factory()->create(['sort_order' => 2]);

    $this->actingAs($this->admin)
        ->patch(route('admin.categories.reorder'), [
            'ids' => [$third->id, $first->id, $second->id],
        ])
        ->assertRedirect();

    expect($third->refresh()->sort_order)->toBe(0)
        ->and($first->refresh()->sort_order)->toBe(1)
        ->and($second->refresh()->sort_order)->toBe(2);
});

it('refuses to delete a category that still holds products', function (): void {
    $category = Category::factory()->create();
    Product::factory()->create(['category_id' => $category->id]);

    $this->actingAs($this->admin)
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect();

    expect(Category::query()->count())->toBe(1)
        ->and(Product::query()->count())->toBe(1);
});

it('deletes an empty category', function (): void {
    $category = Category::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect(route('admin.categories.index'));

    expect(Category::query()->count())->toBe(0);
});
