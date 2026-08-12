<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * Checkout and order confirmation (§7.12).
 */
beforeEach(function (): void {
    withGuestCart();

    Setting::put('shipping_flat_rate_minor', 600);
    Setting::put('free_shipping_threshold_minor', 5000);

    $this->product = Product::factory()->create([
        'name' => ['en' => 'Dehydrated Jackfruit'],
        'sku' => 'DRIO-JF-200',
        'price_minor' => 1580,
        'stock_quantity' => 10,
    ]);
});

function checkoutPayload(array $overrides = []): array
{
    return array_merge([
        'customer_name' => 'Niroshi Perera',
        'customer_email' => 'niroshi@example.com',
        'customer_phone' => '090-1234-5678',
        'postal_code' => '150-0001',
        'prefecture' => 'Tokyo',
        'city' => 'Shibuya',
        'address_line1' => '1-2-3 Jingumae',
        'address_line2' => 'Apt 401',
        'payment_method' => 'card',
        'notes' => '',
    ], $overrides);
}

function fillCart(int $quantity = 2): void
{
    test()->post(route('cart.store'), [
        'product_id' => test()->product->id,
        'quantity' => $quantity,
    ]);
}

it('sends an empty cart back to the cart page instead of checkout', function (): void {
    $this->get(route('checkout.show'))->assertRedirect(route('cart.index'));
});

it('renders checkout with the prefectures and payment stubs', function (): void {
    fillCart();

    $this->get(route('checkout.show'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/checkout/index')
            ->has('prefectures', 47)
            ->has('paymentMethods', 4)
        );
});

it('places an order, snapshots the lines and empties the cart', function (): void {
    fillCart();

    $this->post(route('checkout.store'), checkoutPayload())
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $order = Order::query()->with('items')->firstOrFail();

    expect($order->status)->toBe(OrderStatus::Pending)
        ->and($order->customer_email)->toBe('niroshi@example.com')
        ->and($order->prefecture)->toBe('Tokyo')
        ->and($order->subtotal_minor)->toBe(3160)
        ->and($order->shipping_minor)->toBe(600)
        ->and($order->total_minor)->toBe(3760)
        ->and($order->items)->toHaveCount(1);

    $line = $order->items->first();

    // Snapshots, so renaming or deleting the product later cannot rewrite
    // the record of what was bought.
    expect($line->product_name_snapshot)->toBe('Dehydrated Jackfruit')
        ->and($line->sku_snapshot)->toBe('DRIO-JF-200')
        ->and($line->unit_price_minor)->toBe(1580)
        ->and($line->line_total_minor)->toBe(3160);

    $this->get(route('cart.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('cart.count', 0));
});

it('decrements stock by what was bought', function (): void {
    fillCart(3);

    $this->post(route('checkout.store'), checkoutPayload());

    expect($this->product->refresh()->stock_quantity)->toBe(7);
});

it('charges the price on the product, not the price cached on the cart line', function (): void {
    fillCart(1);

    // Repriced after it went in the basket.
    $this->product->update(['price_minor' => 1880]);

    $this->post(route('checkout.store'), checkoutPayload());

    expect(Order::query()->firstOrFail()->subtotal_minor)->toBe(1880);
});

it('names every field that needs fixing', function (): void {
    fillCart();

    $this->post(route('checkout.store'), checkoutPayload([
        'customer_name' => '',
        'customer_email' => 'not-an-email',
        'postal_code' => 'nope',
        'prefecture' => 'Atlantis',
        'payment_method' => 'crypto',
    ]))->assertSessionHasErrors([
        'customer_name',
        'customer_email',
        'postal_code',
        'prefecture',
        'payment_method',
    ]);

    expect(Order::query()->count())->toBe(0);
});

it('accepts a postal code with or without its hyphen', function (): void {
    fillCart();

    $this->post(route('checkout.store'), checkoutPayload(['postal_code' => '1500001']))
        ->assertSessionHasNoErrors();
});

it('refuses to place an order when stock ran out first', function (): void {
    fillCart(4);

    // Sold out from under the customer between review and submit.
    $this->product->update(['stock_quantity' => 1]);

    $this->post(route('checkout.store'), checkoutPayload())
        ->assertRedirect(route('cart.index'))
        ->assertSessionHasErrors('checkout');

    expect(Order::query()->count())->toBe(0)
        // The whole thing rolled back: no half-written order, no lost stock.
        ->and($this->product->refresh()->stock_quantity)->toBe(1);
});

it('shows the confirmation to whoever just placed the order', function (): void {
    fillCart();

    $this->post(route('checkout.store'), checkoutPayload());

    $order = Order::query()->firstOrFail();

    $this->get(route('checkout.confirmation', $order))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/checkout/confirmation')
            ->where('order.orderNumber', $order->order_number)
            ->has('order.items', 1)
        );
});

it('hides another order\'s confirmation from a stranger', function (): void {
    $order = Order::factory()->create();

    $this->get(route('checkout.confirmation', $order))->assertNotFound();
});

it('lets a signed-in customer reach their own confirmation later', function (): void {
    $user = User::factory()->create();
    $order = Order::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('checkout.confirmation', $order))
        ->assertOk();
});
