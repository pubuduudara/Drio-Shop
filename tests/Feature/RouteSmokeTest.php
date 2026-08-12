<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\HeroSlide;
use App\Models\Order;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Review;
use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * Every GET page in the application renders.
 *
 * Written from the route table rather than a hand-kept list, so a route added
 * without a test still gets walked. This is the cheap check that catches a
 * page nobody opened after a refactor — a resource that dies on a null, a
 * controller that references a dropped column.
 */
function seedEverything(): void
{
    $category = Category::factory()->create([
        'name' => ['en' => 'Dehydrated Vegetables'],
        'slug' => 'dehydrated-vegetables',
        'is_featured' => true,
    ]);

    $product = Product::factory()->create([
        'category_id' => $category->id,
        'name' => ['en' => 'Dehydrated Jackfruit'],
        'slug' => 'dehydrated-jackfruit',
    ]);

    Review::factory()->count(2)->create(['product_id' => $product->id]);
    Review::factory()->featured()->create();

    $recipe = Recipe::factory()->create([
        'title' => ['en' => 'Jackfruit Curry'],
        'slug' => 'jackfruit-curry',
    ]);
    $recipe->products()->attach($product);

    HeroSlide::factory()->create(['headline' => ['en' => 'Authentic Flavours']]);
    Subscriber::factory()->create();

    $order = Order::factory()->create(['order_number' => 'DRIO-20260101-AAAAA']);
    $order->items()->create([
        'product_id' => $product->id,
        'product_name_snapshot' => 'Dehydrated Jackfruit',
        'sku_snapshot' => 'DRIO-JF-200',
        'unit_price_minor' => 1580,
        'quantity' => 2,
        'line_total_minor' => 3160,
    ]);
}

/**
 * Every GET route with no parameters, or whose parameters the seed above can
 * fill. Routes needing a one-off precondition (the order confirmation, which
 * is gated on having just checked out) are covered by their own tests.
 *
 * @return list<array{name: string, uri: string}>
 */
function walkableRoutes(string $prefix): array
{
    $bindings = [
        'product' => 'dehydrated-jackfruit',
        'category' => 'dehydrated-vegetables',
        'recipe' => 'jackfruit-curry',
        'order' => 'DRIO-20260101-AAAAA',
        'heroSlide' => 1,
        'review' => 1,
        'item' => 1,
        'media' => 1,
    ];

    $out = [];

    foreach (Route::getRoutes() as $route) {
        $name = $route->getName();

        if ($name === null || ! in_array('GET', $route->methods(), true)) {
            continue;
        }

        if (! str_starts_with($name, $prefix)) {
            continue;
        }

        /*
         * Gated on state a generic walk cannot fake: the confirmation needs an
         * order just placed in this session, and checkout redirects to the cart
         * unless the basket has something in it. CheckoutTest asserts both.
         */
        if (in_array($name, ['checkout.confirmation', 'checkout.show'], true)) {
            continue;
        }

        $parameters = [];
        $skip = false;

        foreach ($route->parameterNames() as $parameter) {
            if (! array_key_exists($parameter, $bindings)) {
                $skip = true;

                break;
            }

            // Admin routes bind on `{model:id}`; the storefront on the slug.
            $parameters[$parameter] = $route->bindingFieldFor($parameter) === 'id'
                ? 1
                : $bindings[$parameter];
        }

        if ($skip) {
            continue;
        }

        $out[] = ['name' => $name, 'uri' => route($name, $parameters, absolute: false)];
    }

    return $out;
}

it('renders every storefront page', function (): void {
    seedEverything();

    $walked = 0;

    foreach (walkableRoutes('') as $route) {
        if (str_starts_with($route['name'], 'admin.')) {
            continue;
        }

        /*
         * Auth, account and Fortify's own endpoints have their own suites and
         * their own preconditions — `password.confirmation` is a JSON status
         * probe rather than a page, and redirects for a guest by design. This
         * walk is the public storefront.
         */
        if (in_array($route['name'], [
            'login', 'register', 'password.request', 'password.reset',
            'password.confirm', 'password.confirmation', 'verification.notice',
            'dashboard', 'profile.edit', 'security.edit', 'appearance.edit',
            'settings', 'storage.local',
        ], true)) {
            continue;
        }

        $this->get($route['uri'])
            ->assertOk("GET {$route['uri']} ({$route['name']}) did not render");

        $walked++;
    }

    expect($walked)->toBeGreaterThanOrEqual(10);
});

it('renders every admin page for an admin', function (): void {
    seedEverything();

    $admin = User::factory()->create(['is_admin' => true]);
    $walked = 0;

    foreach (walkableRoutes('admin.') as $route) {
        $this->actingAs($admin)
            ->get($route['uri'])
            ->assertOk("GET {$route['uri']} ({$route['name']}) did not render");

        $walked++;
    }

    // Dashboard, products (3), categories (3), orders (3), recipes (3),
    // reviews, hero slides (3), subscribers (2), settings.
    expect($walked)->toBeGreaterThanOrEqual(18);
});

it('refuses every admin page to a signed-in non-admin', function (): void {
    seedEverything();

    $user = User::factory()->create(['is_admin' => false]);

    foreach (walkableRoutes('admin.') as $route) {
        $this->actingAs($user)
            ->get($route['uri'])
            ->assertForbidden("GET {$route['uri']} ({$route['name']}) was not gated");
    }
});

it('refuses every admin page to a guest', function (): void {
    seedEverything();

    foreach (walkableRoutes('admin.') as $route) {
        $this->get($route['uri'])
            ->assertRedirect(route('login'));
    }
});
