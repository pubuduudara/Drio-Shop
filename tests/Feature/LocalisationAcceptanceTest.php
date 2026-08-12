<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\HeroSlide;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Review;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * The §9.7 acceptance test, run against the surfaces Phases 5–7 added.
 *
 * LocalisationTest covers the plumbing — prefixes, route names, the `<html>`
 * attributes. This covers the promise those exist for: that with a second
 * locale enabled, translated content renders in it, untranslated content falls
 * back to English rather than breaking, and every admin form grows locale tabs
 * without a component rewrite.
 *
 * `locales.enabled` stays `['en']` in config; these tests flip it per case
 * through the `withLocales` helper in tests/Pest.php.
 */
beforeEach(function (): void {
    $this->category = Category::factory()->create([
        'name' => ['en' => 'Dehydrated Vegetables', 'ja' => '乾燥野菜'],
        'slug' => 'dehydrated-vegetables',
        'is_featured' => true,
    ]);

    // Translated.
    $this->translated = Product::factory()->create([
        'category_id' => $this->category->id,
        'name' => ['en' => 'Dehydrated Jackfruit', 'ja' => '乾燥ジャックフルーツ'],
        'short_description' => ['en' => 'Sun-dried and ready.', 'ja' => '天日干し。'],
        'slug' => 'dehydrated-jackfruit',
        'sort_order' => 0,
    ]);

    // Deliberately English-only: a half-translated catalogue must still render
    // a complete page (§9.4).
    $this->untranslated = Product::factory()->create([
        'category_id' => $this->category->id,
        'name' => ['en' => 'Roasted Curry Powder'],
        'slug' => 'roasted-curry-powder',
        'sort_order' => 1,
    ]);
});

it('renders translated catalogue content and falls back for the rest', function (): void {
    withLocales(['en', 'ja']);

    $this->get('/ja/shop')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/shop/index')
            ->where('locale', 'ja')
            ->has('products.data', 2)
            ->where('products.data.0.name', '乾燥ジャックフルーツ')
            // Falls back rather than rendering an empty string.
            ->where('products.data.1.name', 'Roasted Curry Powder')
            ->where('categories.0.name', '乾燥野菜')
        );
});

it('serves a product detail page in the second locale on the same slug', function (): void {
    withLocales(['en', 'ja']);

    // Slugs are deliberately not translatable — one canonical URL (§6).
    $this->get('/ja/products/dehydrated-jackfruit')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('product.name', '乾燥ジャックフルーツ')
            ->where('product.shortDescription', '天日干し。')
            ->where('product.category.name', '乾燥野菜')
        );

    $this->get('/products/dehydrated-jackfruit')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('product.name', 'Dehydrated Jackfruit')
        );
});

it('resolves translatable lists on a recipe, and falls back per field', function (): void {
    $recipe = Recipe::factory()->create([
        'title' => ['en' => 'Jackfruit Curry', 'ja' => 'ジャックフルーツカレー'],
        'ingredients' => ['en' => ['200g jackfruit', '2 tbsp curry powder']],
        'steps' => ['en' => ['Soak.', 'Temper.'], 'ja' => ['浸す。', 'テンパリング。']],
        'slug' => 'jackfruit-curry',
    ]);

    withLocales(['en', 'ja']);

    $this->get("/ja/recipes/{$recipe->slug}")
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('recipe.title', 'ジャックフルーツカレー')
            // Translated list resolves; the untranslated one falls back whole.
            ->where('recipe.steps', ['浸す。', 'テンパリング。'])
            ->where('recipe.ingredients', ['200g jackfruit', '2 tbsp curry powder'])
        );
});

it('carries the cart and checkout through the prefixed locale', function (): void {
    withGuestCart();
    withLocales(['en', 'ja']);

    $this->post('/ja/cart', [
        'product_id' => $this->translated->id,
        'quantity' => 1,
    ])->assertRedirect();

    $this->get('/ja/cart')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('locale', 'ja')
            ->where('cart.count', 1)
            // The cart line reads the product in the active locale (§9.4).
            ->where('cart.lines.0.name', '乾燥ジャックフルーツ')
        );

    $this->get('/ja/checkout')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/checkout/index')
            ->where('locale', 'ja')
        );
});

it('shares the locale set every switcher and admin form reads', function (): void {
    withLocales(['en', 'ja']);

    $this->get('/ja/shop')
        ->assertInertia(fn (AssertableInertia $page) => $page
            // What makes <LocaleSwitcher /> render and <TranslatableField />
            // grow tabs — neither carries its own list (§9.1, §9.5).
            ->where('enabledLocales', ['en', 'ja'])
            ->where('localeMeta.ja.label', '日本語')
            ->where('localeMeta.ja.font', 'cjk')
        );
});

describe('admin forms', function (): void {
    beforeEach(function (): void {
        $this->admin = User::factory()->create(['is_admin' => true]);
    });

    it('hands every translatable field a value per enabled locale', function (): void {
        withLocales(['en', 'ja']);

        $this->actingAs($this->admin)
            ->get(route('admin.products.edit', $this->untranslated))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                // The untranslated locale arrives as an empty string rather
                // than missing, so the tab renders instead of crashing (§9.5).
                ->where('product.name', [
                    'en' => 'Roasted Curry Powder',
                    'ja' => '',
                ])
            );
    });

    it('does the same for a recipe\'s translatable lists', function (): void {
        $recipe = Recipe::factory()->create([
            'title' => ['en' => 'Polos Curry'],
            'ingredients' => ['en' => ['Polos']],
            'steps' => ['en' => ['Simmer.']],
        ]);

        withLocales(['en', 'ja']);

        $this->actingAs($this->admin)
            ->get(route('admin.recipes.edit', $recipe))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('recipe.ingredients', ['en' => ['Polos'], 'ja' => []])
                ->where('recipe.steps', ['en' => ['Simmer.'], 'ja' => []])
            );
    });

    it('does the same for a hero slide', function (): void {
        $slide = HeroSlide::factory()->create([
            'headline' => ['en' => 'Authentic Sri Lankan Flavours'],
        ]);

        withLocales(['en', 'ja']);

        $this->actingAs($this->admin)
            ->get(route('admin.hero-slides.edit', $slide))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('slide.headline', [
                    'en' => 'Authentic Sri Lankan Flavours',
                    'ja' => '',
                ])
            );
    });

    it('keeps raw translation JSON out of the moderation queue', function (): void {
        Review::factory()->create(['body' => ['en' => 'Tastes like home.']]);

        withLocales(['en', 'ja']);

        // §9.4 reserves the full translation map for the admin *edit form*.
        // The queue is a list, so it gets the body resolved to one string.
        $this->actingAs($this->admin)
            ->get(route('admin.reviews.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('reviews.data.0.body', 'Tastes like home.')
                ->missing('reviews.data.0.bodyTranslations')
            );
    });

    it('requires the default locale and treats the others as optional', function (): void {
        withLocales(['en', 'ja']);

        // Japanese missing is fine.
        $this->actingAs($this->admin)
            ->post(route('admin.categories.store'), [
                'name' => ['en' => 'Curry Powder', 'ja' => ''],
                'slug' => 'curry-powder',
                'icon_key' => 'powder',
            ])
            ->assertSessionHasNoErrors();

        // English missing is not.
        $this->actingAs($this->admin)
            ->post(route('admin.categories.store'), [
                'name' => ['en' => '', 'ja' => 'チリパウダー'],
                'slug' => 'chilli-powder',
                'icon_key' => 'chilli',
            ])
            ->assertSessionHasErrors('name.en');
    });
});

it('leaves config shipping English-only', function (): void {
    // The architecture is the deliverable, not the Japanese content (§9.7).
    expect(config('locales.enabled'))->toBe(['en']);
});
