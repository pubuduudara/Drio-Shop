<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\HeroSlide;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Review;
use App\Models\Subscriber;
use Illuminate\Routing\RouteCollection;
use Inertia\Testing\AssertableInertia;

/**
 * The homepage (§7.1–7.11) and the newsletter endpoint behind it.
 */
function seedHomepage(): void
{
    $category = Category::factory()->featured()->create([
        'name' => ['en' => 'Dehydrated Vegetables'],
        'slug' => 'dehydrated-vegetables',
    ]);

    $product = Product::factory()->bestSeller()->create([
        'category_id' => $category->id,
        'name' => ['en' => 'Dehydrated Jackfruit'],
        'slug' => 'dehydrated-jackfruit',
        'price_minor' => 1580,
    ]);

    // Two fives and two fours average to exactly 4.5, which is what the card
    // renders as a half star.
    Review::factory()->count(2)->create(['product_id' => $product->id, 'rating' => 5]);
    Review::factory()->count(2)->create(['product_id' => $product->id, 'rating' => 4]);

    Review::factory()->featured()->create([
        'customer_name' => 'Niroshi',
        'customer_city' => 'Tokyo',
    ]);

    Recipe::factory()->create(['title' => ['en' => 'Jackfruit Curry']]);
    HeroSlide::factory()->create([
        'headline' => ['en' => "Authentic\nSri Lankan Flavours,\nDelivered Across Japan"],
    ]);
}

it('renders every section from seeded data', function (): void {
    seedHomepage();

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/home')
            ->has('heroSlides', 1)
            ->has('categories', 1)
            ->has('bestSellers', 1)
            ->has('recipes', 1)
            ->has('reviews', 1)
            ->where('instagramTileCount', 7)
        );
});

it('splits the hero headline on its authored line breaks', function (): void {
    seedHomepage();

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('heroSlides.0.headlineLines', [
                'Authentic',
                'Sri Lankan Flavours,',
                'Delivered Across Japan',
            ])
        );
});

it('sends products as plain strings and integer minor units, never raw models', function (): void {
    seedHomepage();

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('bestSellers.0.name', 'Dehydrated Jackfruit')
            ->where('bestSellers.0.priceMinor', 1580)
            ->where('bestSellers.0.currency', 'JPY')
            // The card's stars come from the reviews table, aggregated in the
            // query rather than counted per card.
            ->where('bestSellers.0.rating', 4.5)
            ->where('bestSellers.0.reviewsCount', 4)
            // No media uploaded yet, so `<Media />` renders the placeholder.
            ->where('bestSellers.0.media', null)
        );
});

it('excludes inactive products from the best sellers row', function (): void {
    seedHomepage();
    Product::factory()->bestSeller()->inactive()->create();

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->has('bestSellers', 1));
});

it('leaves the page renderable when nothing has been seeded', function (): void {
    // Every section returns null rather than throwing on an empty catalogue,
    // which is what a fresh install looks like.
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('heroSlides', 0)
            ->has('bestSellers', 0)
        );
});

describe('the newsletter endpoint', function (): void {
    it('records a subscriber with the locale they were reading', function (): void {
        $this->post('/subscribe', ['email' => 'niroshi@example.jp'])
            ->assertRedirect();

        expect(Subscriber::query()->where('email', 'niroshi@example.jp')->first())
            ->not->toBeNull()
            ->locale->toBe('en');
    });

    it('rejects a malformed address with a message that says what to fix', function (): void {
        $this->post('/subscribe', ['email' => 'not-an-email'])
            ->assertSessionHasErrors(['email' => 'Enter a valid email address.']);

        expect(Subscriber::query()->count())->toBe(0);
    });

    it('rejects an address that is already subscribed', function (): void {
        Subscriber::factory()->create(['email' => 'niroshi@example.jp']);

        $this->post('/subscribe', ['email' => 'niroshi@example.jp'])
            ->assertSessionHasErrors(['email' => 'That address is already subscribed.']);

        expect(Subscriber::query()->count())->toBe(1);
    });
});

/**
 * The §9.7 acceptance test, run as code rather than by hand.
 *
 * This is the Phase 3 deliverable: proof that enabling a second locale is a
 * config change. `withLocales` re-registers routes exactly as boot would.
 */
describe('the localisation acceptance test (§9.7)', function (): void {
    it('resolves /ja, renders translated content and falls back for the rest', function (): void {
        seedHomepage();

        // One product translated, everything else left English on purpose.
        $product = Product::query()->where('slug', 'dehydrated-jackfruit')->firstOrFail();
        $product->setTranslation('name', 'ja', '乾燥ジャックフルーツ')->save();

        withLocales(['en', 'ja']);

        $this->get('/ja')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('storefront/home')
                ->where('locale', 'ja')
                // Two locales enabled is what makes the switcher render.
                ->where('enabledLocales', ['en', 'ja'])
                // Translated content comes back in Japanese...
                ->where('bestSellers.0.name', '乾燥ジャックフルーツ')
                // ...and untranslated content falls back to English rather
                // than rendering an empty string (§9.4).
                ->where('categories.0.name', 'Dehydrated Vegetables')
                ->where('recipes.0.title', 'Jackfruit Curry')
            );
    });

    it('keeps the English homepage unprefixed and untouched', function (): void {
        seedHomepage();
        withLocales(['en', 'ja']);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('locale', 'en')
                ->where('bestSellers.0.name', 'Dehydrated Jackfruit')
            );
    });

    it('404s /ja again the moment the locale is disabled', function (): void {
        seedHomepage();

        // The shipped configuration: English only.
        $router = app('router');
        $router->setRoutes(new RouteCollection);
        require base_path('routes/web.php');
        $router->getRoutes()->refreshNameLookups();

        $this->get('/ja')->assertNotFound();
        $this->get('/')->assertOk();
    });
});
