<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Review;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Pages cost a fixed number of queries no matter how much is on them.
 *
 * The budgets below are deliberately loose — this is not a benchmark, it is a
 * tripwire for the N+1 that arrives when someone reads a relation inside a
 * `map`. Each test doubles the row count and asserts the query count does not
 * move, which catches that regardless of the absolute number.
 */
function countQueriesFor(callable $request): int
{
    // Warm anything cached per-process — Setting::values() is remembered
    // forever, so the first request of a test pays for it and later ones do
    // not, which would read as a query count that shrinks as data grows.
    $request();

    DB::flushQueryLog();
    DB::enableQueryLog();

    $request();

    $count = count(DB::getQueryLog());
    DB::disableQueryLog();

    return $count;
}

function seedCatalogue(int $products): void
{
    $category = Category::factory()->create(['is_featured' => true]);

    Product::factory()->count($products)->create(['category_id' => $category->id])
        ->each(fn (Product $product) => Review::factory()->count(2)->create([
            'product_id' => $product->id,
        ]));
}

it('serves the shop in a fixed number of queries', function (): void {
    seedCatalogue(3);
    $small = countQueriesFor(fn () => $this->get(route('shop'))->assertOk());

    seedCatalogue(9);
    $large = countQueriesFor(fn () => $this->get(route('shop'))->assertOk());

    expect($large)->toBe($small);
});

it('serves the homepage in a fixed number of queries', function (): void {
    seedCatalogue(3);
    $small = countQueriesFor(fn () => $this->get(route('home'))->assertOk());

    seedCatalogue(9);
    $large = countQueriesFor(fn () => $this->get(route('home'))->assertOk());

    expect($large)->toBe($small);
});

it('serves a cart in a fixed number of queries however many lines it holds', function (): void {
    withGuestCart();
    seedCatalogue(6);

    $products = Product::query()->take(6)->get();

    foreach ($products->take(2) as $product) {
        $this->post(route('cart.store'), ['product_id' => $product->id, 'quantity' => 1]);
    }

    $small = countQueriesFor(fn () => $this->get(route('cart.index'))->assertOk());

    foreach ($products->skip(2) as $product) {
        $this->post(route('cart.store'), ['product_id' => $product->id, 'quantity' => 1]);
    }

    $large = countQueriesFor(fn () => $this->get(route('cart.index'))->assertOk());

    expect($large)->toBe($small);
});

it('serves the admin products table in a fixed number of queries', function (): void {
    $admin = User::factory()->create(['is_admin' => true]);

    seedCatalogue(3);
    $small = countQueriesFor(
        fn () => $this->actingAs($admin)->get(route('admin.products.index'))->assertOk(),
    );

    seedCatalogue(9);
    $large = countQueriesFor(
        fn () => $this->actingAs($admin)->get(route('admin.products.index'))->assertOk(),
    );

    expect($large)->toBe($small);
});

it('serves the admin orders table in a fixed number of queries', function (): void {
    $admin = User::factory()->create(['is_admin' => true]);

    Order::factory()->count(3)->create();
    $small = countQueriesFor(
        fn () => $this->actingAs($admin)->get(route('admin.orders.index'))->assertOk(),
    );

    Order::factory()->count(9)->create();
    $large = countQueriesFor(
        fn () => $this->actingAs($admin)->get(route('admin.orders.index'))->assertOk(),
    );

    expect($large)->toBe($small);
});

it('serves the recipe index in a fixed number of queries', function (): void {
    Recipe::factory()->count(3)->create();
    $small = countQueriesFor(fn () => $this->get(route('recipes.index'))->assertOk());

    Recipe::factory()->count(9)->create();
    $large = countQueriesFor(fn () => $this->get(route('recipes.index'))->assertOk());

    expect($large)->toBe($small);
});
