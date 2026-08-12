<?php

declare(strict_types=1);

use App\Models\HeroSlide;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Review;
use App\Models\Setting;
use App\Models\Subscriber;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * The remaining admin modules (§8): recipes, reviews, hero slides,
 * subscribers and settings.
 */
beforeEach(function (): void {
    $this->admin = User::factory()->create(['is_admin' => true]);
});

function recipePayload(array $overrides = []): array
{
    return array_merge([
        'title' => ['en' => 'Jackfruit Curry'],
        'intro' => ['en' => 'The curry that converts people.'],
        'ingredients' => ['en' => ['200g dehydrated jackfruit', '2 tbsp curry powder']],
        'steps' => ['en' => ['Soak the jackfruit.', 'Temper the spices.']],
        'slug' => 'jackfruit-curry',
        'prep_minutes' => 15,
        'cook_minutes' => 35,
        'serves' => 4,
        'is_vegetarian' => true,
        'is_traditional' => true,
        'is_quick' => false,
        'is_published' => true,
        'sort_order' => 0,
        'product_ids' => [],
    ], $overrides);
}

/* ---------------------------------------------------------------- recipes */

it('creates a recipe with its translatable lists and product links', function (): void {
    $product = Product::factory()->create();

    $this->actingAs($this->admin)
        ->post(route('admin.recipes.store'), recipePayload([
            'product_ids' => [$product->id],
        ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $recipe = Recipe::query()->with('products')->firstOrFail();

    expect($recipe->title)->toBe('Jackfruit Curry')
        ->and($recipe->ingredients)->toBe(['200g dehydrated jackfruit', '2 tbsp curry powder'])
        ->and($recipe->steps)->toHaveCount(2)
        ->and($recipe->products)->toHaveCount(1);
});

it('drops the blank rows a repeatable builder leaves behind', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.recipes.store'), recipePayload([
            'ingredients' => ['en' => ['200g jackfruit', '', '  ', '1 tsp salt']],
        ]))
        ->assertSessionHasNoErrors();

    expect(Recipe::query()->firstOrFail()->ingredients)
        ->toBe(['200g jackfruit', '1 tsp salt']);
});

it('refuses a recipe with no method', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.recipes.store'), recipePayload(['steps' => ['en' => []]]))
        ->assertSessionHasErrors('steps.en');

    expect(Recipe::query()->count())->toBe(0);
});

it('hands the recipe form the full translation maps', function (): void {
    $recipe = Recipe::factory()->create([
        'title' => ['en' => 'Polos Curry'],
        'ingredients' => ['en' => ['Polos', 'Coconut milk']],
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.recipes.edit', $recipe))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/recipes/edit')
            ->where('recipe.title', ['en' => 'Polos Curry'])
            ->where('recipe.ingredients', ['en' => ['Polos', 'Coconut milk']])
        );
});

/* ---------------------------------------------------------------- reviews */

it('leads the moderation queue with what needs a decision', function (): void {
    Review::factory()->create(['is_published' => true]);
    Review::factory()->count(2)->create(['is_published' => false]);

    $this->actingAs($this->admin)
        ->get(route('admin.reviews.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/reviews/index')
            ->has('reviews.data', 3)
            ->where('pendingCount', 2)
            ->where('reviews.data.0.isPublished', false)
        );
});

it('approves, features and unpublishes a review in one click', function (): void {
    $review = Review::factory()->create(['is_published' => false, 'is_featured' => false]);

    $this->actingAs($this->admin)
        ->patch(route('admin.reviews.moderate', $review), ['action' => 'publish']);

    expect($review->refresh()->is_published)->toBeTrue();

    $this->actingAs($this->admin)
        ->patch(route('admin.reviews.moderate', $review), ['action' => 'feature']);

    expect($review->refresh()->is_featured)->toBeTrue();

    $this->actingAs($this->admin)
        ->patch(route('admin.reviews.moderate', $review), ['action' => 'unpublish']);

    $review->refresh();

    // Unpublishing pulls it off the homepage too: not good enough to show is
    // not good enough to feature.
    expect($review->is_published)->toBeFalse()
        ->and($review->is_featured)->toBeFalse();
});

it('filters the queue by state', function (): void {
    Review::factory()->create(['is_published' => false]);
    Review::factory()->featured()->create();

    $this->actingAs($this->admin)
        ->get(route('admin.reviews.index', ['status' => 'featured']))
        ->assertInertia(fn (AssertableInertia $page) => $page->has('reviews.data', 1));

    $this->actingAs($this->admin)
        ->get(route('admin.reviews.index', ['status' => 'pending']))
        ->assertInertia(fn (AssertableInertia $page) => $page->has('reviews.data', 1));
});

/* ------------------------------------------------------------ hero slides */

it('creates a hero slide and keeps its links app-relative', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.hero-slides.store'), [
            'headline' => ['en' => "Authentic\nSri Lankan Flavours"],
            'subhead' => ['en' => 'Shipped across Japan.'],
            'primary_cta_label' => ['en' => 'Shop Now'],
            'primary_cta_href' => '/shop',
            'secondary_cta_label' => ['en' => 'Our Story'],
            'secondary_cta_href' => '/about',
            'sort_order' => 0,
            'is_active' => true,
        ])
        ->assertRedirect(route('admin.hero-slides.index'))
        ->assertSessionHasNoErrors();

    expect(HeroSlide::query()->firstOrFail()->primary_cta_href)->toBe('/shop');
});

it('refuses a hero link that would send the homepage off-site', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.hero-slides.store'), [
            'headline' => ['en' => 'Headline'],
            'primary_cta_href' => 'https://example.com',
        ])
        ->assertSessionHasErrors('primary_cta_href');
});

it('reorders hero slides from the posted position', function (): void {
    $first = HeroSlide::factory()->create(['sort_order' => 0]);
    $second = HeroSlide::factory()->create(['sort_order' => 1]);

    $this->actingAs($this->admin)
        ->patch(route('admin.hero-slides.reorder'), [
            'ids' => [$second->id, $first->id],
        ])
        ->assertRedirect();

    expect($second->refresh()->sort_order)->toBe(0)
        ->and($first->refresh()->sort_order)->toBe(1);
});

/* ----------------------------------------------------------- subscribers */

it('lists subscribers and exports them as CSV', function (): void {
    Subscriber::factory()->create(['email' => 'niroshi@example.com', 'locale' => 'en']);

    $this->actingAs($this->admin)
        ->get(route('admin.subscribers.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/subscribers/index')
            ->has('subscribers.data', 1)
            ->where('total', 1)
        );

    $response = $this->actingAs($this->admin)
        ->get(route('admin.subscribers.export'))
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');

    expect($response->streamedContent())
        ->toContain('email,locale,confirmed_at,subscribed_at')
        ->toContain('niroshi@example.com');
});

/* -------------------------------------------------------------- settings */

it('saves only the settings the form declares', function (): void {
    Setting::put('currency', 'JPY');

    $this->actingAs($this->admin)
        ->put(route('admin.settings.update'), [
            'shipping_flat_rate_minor' => 800,
            'free_shipping_threshold_minor' => 6000,
            'contact_email' => 'hello@drio.jp',
            'contact_phone' => '03-1234-5678',
            'contact_address' => 'Shibuya, Tokyo',
            'instagram_handle' => '@drio',
            'instagram_url' => 'https://instagram.com/drio',
            'facebook_url' => '',
            'youtube_url' => '',
            // Not in the allow-list, so it must not be written.
            'currency' => 'USD',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect(Setting::shippingFlatRateMinor())->toBe(800)
        ->and(Setting::freeShippingThresholdMinor())->toBe(6000)
        ->and(Setting::currency())->toBe('JPY');
});

it('rejects an invalid contact email rather than saving it', function (): void {
    $this->actingAs($this->admin)
        ->put(route('admin.settings.update'), [
            'shipping_flat_rate_minor' => 600,
            'free_shipping_threshold_minor' => 5000,
            'contact_email' => 'not-an-email',
        ])
        ->assertSessionHasErrors('contact_email');
});

it('keeps a non-admin out of every module', function (): void {
    $user = User::factory()->create(['is_admin' => false]);

    foreach ([
        'admin.recipes.index',
        'admin.reviews.index',
        'admin.hero-slides.index',
        'admin.subscribers.index',
        'admin.settings.edit',
    ] as $route) {
        $this->actingAs($user)->get(route($route))->assertForbidden();
    }
});
