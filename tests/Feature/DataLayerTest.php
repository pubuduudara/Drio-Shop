<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Review;
use App\Models\Setting;
use App\Models\User;

describe('translatable content', function (): void {
    it('resolves a translatable column to a plain string, hiding the JSON', function (): void {
        $product = Product::factory()->create([
            'name' => ['en' => 'Dehydrated Jackfruit'],
        ]);

        expect($product->name)->toBe('Dehydrated Jackfruit')
            ->toBeString()
            ->and($product->getTranslations('name'))->toBe(['en' => 'Dehydrated Jackfruit']);
    });

    it('falls back to the default locale rather than rendering an empty string', function (): void {
        // The half-translated catalogue case from §9.4: a record with no value
        // in the active locale must still render a complete page.
        $product = Product::factory()->create([
            'name' => ['en' => 'Roasted Curry Powder'],
        ]);

        app()->setLocale('ja');

        expect($product->fresh()->name)->toBe('Roasted Curry Powder');
    });

    it('stores a translation alongside the fallback without a migration', function (): void {
        $product = Product::factory()->create(['name' => ['en' => 'Chilli Powder']]);

        $product->setTranslation('name', 'ja', 'チリパウダー')->save();

        app()->setLocale('ja');
        expect($product->fresh()->name)->toBe('チリパウダー');

        app()->setLocale('en');
        expect($product->fresh()->name)->toBe('Chilli Powder');
    });

    it('treats a translatable list as a list once the locale is resolved', function (): void {
        $recipe = Recipe::factory()->create([
            'steps' => ['en' => ['Soak the jackfruit.', 'Bloom the curry leaves.']],
        ]);

        expect($recipe->steps)->toBeArray()
            ->and($recipe->steps[0])->toBe('Soak the jackfruit.');
    });
});

describe('money', function (): void {
    it('keeps prices as integer minor units, never floats', function (): void {
        $product = Product::factory()->create(['price_minor' => 1580]);

        expect($product->price_minor)->toBe(1580)->toBeInt();
    });

    it('knows when to show a struck-through was-price', function (): void {
        $onSale = Product::factory()->create([
            'price_minor' => 880,
            'compare_at_price_minor' => 1180,
        ]);
        $regular = Product::factory()->create([
            'price_minor' => 880,
            'compare_at_price_minor' => null,
        ]);

        expect($onSale->isOnSale())->toBeTrue()
            ->and($regular->isOnSale())->toBeFalse();
    });

    it('totals a cart line from its own quantity and unit price', function (): void {
        $cart = Cart::factory()->create();
        $product = Product::factory()->create(['price_minor' => 980]);

        CartItem::factory()->forProduct($product, 3)->create(['cart_id' => $cart->id]);

        expect($cart->fresh()->subtotalMinor())->toBe(2940)
            ->and($cart->itemCount())->toBe(3);
    });
});

describe('relationships', function (): void {
    it('links recipes and products through the recipe_product pivot', function (): void {
        $recipe = Recipe::factory()->create();
        $products = Product::factory()->count(3)->create();

        $recipe->products()->sync($products->pluck('id'));

        expect($recipe->products)->toHaveCount(3)
            ->and($products->first()->fresh()->recipes)->toHaveCount(1);
    });

    it('keeps a category and its products connected in both directions', function (): void {
        $category = Category::factory()->create();
        Product::factory()->count(4)->create(['category_id' => $category->id]);

        expect($category->products)->toHaveCount(4)
            ->and($category->products->first()->category->id)->toBe($category->id);
    });

    it('allows a review with no product, for brand testimonials', function (): void {
        $review = Review::factory()->featured()->create();

        expect($review->product_id)->toBeNull()
            ->and($review->product)->toBeNull()
            ->and($review->is_featured)->toBeTrue();
    });

    it('preserves an order line after its product is deleted', function (): void {
        $product = Product::factory()->create([
            'name' => ['en' => 'Cinnamon Quills'],
            'sku' => 'DRIO-CQ-050',
            'price_minor' => 1380,
        ]);
        $order = Order::factory()->create();
        $item = OrderItem::factory()->forProduct($product, 2)->create(['order_id' => $order->id]);

        $product->forceDelete();

        $item->refresh();

        // The snapshot is the point: the order still reads correctly.
        expect($item->product_id)->toBeNull()
            ->and($item->product_name_snapshot)->toBe('Cinnamon Quills')
            ->and($item->sku_snapshot)->toBe('DRIO-CQ-050')
            ->and($item->line_total_minor)->toBe(2760);
    });
});

describe('scopes and stock', function (): void {
    it('narrows products to the active, best-selling set', function (): void {
        Product::factory()->count(3)->create();
        Product::factory()->count(2)->bestSeller()->create();
        Product::factory()->inactive()->bestSeller()->create();

        expect(Product::query()->active()->bestSellers()->count())->toBe(2);
    });

    it('distinguishes out of stock from low stock', function (): void {
        $out = Product::factory()->outOfStock()->create();
        $low = Product::factory()->create(['stock_quantity' => 4]);
        $fine = Product::factory()->create(['stock_quantity' => 90]);

        expect($out->isInStock())->toBeFalse()
            ->and($out->isLowStock())->toBeFalse()
            ->and($low->isLowStock())->toBeTrue()
            ->and($fine->isLowStock())->toBeFalse();
    });

    it('only publishes reviews that are marked published', function (): void {
        Review::factory()->count(2)->create();
        Review::factory()->unpublished()->create();

        expect(Review::query()->published()->count())->toBe(2);
    });
});

describe('order status', function (): void {
    it('allows only the transitions the business permits', function (): void {
        expect(OrderStatus::Pending->canTransitionTo(OrderStatus::Paid))->toBeTrue()
            ->and(OrderStatus::Pending->canTransitionTo(OrderStatus::Shipped))->toBeFalse()
            ->and(OrderStatus::Delivered->canTransitionTo(OrderStatus::Refunded))->toBeTrue()
            ->and(OrderStatus::Cancelled->allowedTransitions())->toBe([]);
    });

    it('counts only paid-through statuses towards revenue', function (): void {
        Order::factory()->status(OrderStatus::Pending)->create();
        Order::factory()->status(OrderStatus::Paid)->create();
        Order::factory()->status(OrderStatus::Shipped)->create();
        Order::factory()->status(OrderStatus::Cancelled)->create();

        expect(Order::query()->paid()->count())->toBe(2);
    });

    it('casts status to the enum rather than a raw string', function (): void {
        $order = Order::factory()->status(OrderStatus::Processing)->create();

        expect($order->fresh()->status)->toBe(OrderStatus::Processing);
    });

    it('generates a unique, date-prefixed order number', function (): void {
        $numbers = collect(range(1, 20))->map(fn (): string => Order::generateOrderNumber());

        expect($numbers->unique())->toHaveCount(20)
            ->and($numbers->first())->toStartWith('DRIO-'.now()->format('Ymd'));
    });
});

describe('settings', function (): void {
    it('reads and writes through the cache without going stale', function (): void {
        Setting::put('shipping_flat_rate_minor', 600);
        expect(Setting::get('shipping_flat_rate_minor'))->toBe(600);

        Setting::put('shipping_flat_rate_minor', 750);
        expect(Setting::get('shipping_flat_rate_minor'))->toBe(750);
    });

    it('returns the default for a key that was never set', function (): void {
        expect(Setting::get('nothing_here', 'fallback'))->toBe('fallback');
    });
});

describe('the admin account', function (): void {
    it('opens the admin gate for a seeded admin and keeps it shut otherwise', function (): void {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();

        expect($admin->can('access-admin'))->toBeTrue()
            ->and($customer->can('access-admin'))->toBeFalse();
    });

    it('lets a real admin reach the console', function (): void {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/admin')->assertOk();
    });
});
