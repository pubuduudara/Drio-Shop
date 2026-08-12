<?php

declare(strict_types=1);

use App\Models\Cart;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * The server-backed cart (§6, §7.4).
 */
beforeEach(function (): void {
    // A browser carries the cart cookie; the test client has to be told to.
    withGuestCart();

    $this->product = Product::factory()->create([
        'name' => ['en' => 'Dehydrated Jackfruit'],
        'price_minor' => 1580,
        'stock_quantity' => 5,
    ]);
});

it('shares an empty cart to a visitor who has never added anything', function (): void {
    $this->get(route('shop'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('cart.count', 0)
            ->where('cart.lines', [])
            ->where('cart.totals.totalMinor', 0)
        );

    // Reading must not create a row — the header asks on every request.
    expect(Cart::query()->count())->toBe(0);
});

it('adds a product and shares it back on the next page', function (): void {
    $this->post(route('cart.store'), [
        'product_id' => $this->product->id,
        'quantity' => 2,
    ])->assertRedirect();

    $this->get(route('shop'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('cart.count', 2)
            ->has('cart.lines', 1)
            ->where('cart.lines.0.name', 'Dehydrated Jackfruit')
            ->where('cart.lines.0.lineTotalMinor', 3160)
            ->where('cart.totals.subtotalMinor', 3160)
        );
});

it('tops up the existing line rather than adding a second one', function (): void {
    $this->post(route('cart.store'), ['product_id' => $this->product->id, 'quantity' => 1]);
    $this->post(route('cart.store'), ['product_id' => $this->product->id, 'quantity' => 2]);

    $this->get(route('shop'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('cart.lines', 1)
            ->where('cart.count', 3)
        );
});

it('clamps to available stock and says so', function (): void {
    $this->post(route('cart.store'), [
        'product_id' => $this->product->id,
        'quantity' => 20,
    ])->assertSessionHasErrors('quantity');

    $this->get(route('shop'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('cart.count', 5));
});

it('refuses a product that is not on sale', function (): void {
    $inactive = Product::factory()->create(['is_active' => false]);

    $this->post(route('cart.store'), ['product_id' => $inactive->id, 'quantity' => 1])
        ->assertSessionHasErrors('product_id');
});

it('removes a line when its quantity goes to zero', function (): void {
    $this->post(route('cart.store'), ['product_id' => $this->product->id, 'quantity' => 2]);

    $item = Cart::query()->firstOrFail()->items()->firstOrFail();

    $this->patch(route('cart.items.update', $item), ['quantity' => 0])
        ->assertRedirect();

    expect(Cart::query()->firstOrFail()->items()->count())->toBe(0);
});

it('refuses to touch another visitor\'s cart item', function (): void {
    $otherCart = Cart::factory()->create(['session_id' => 'someone-elses-token']);
    $item = $otherCart->items()->create([
        'product_id' => $this->product->id,
        'quantity' => 1,
        'unit_price_minor' => 1580,
    ]);

    $this->delete(route('cart.items.destroy', $item))->assertNotFound();

    expect($otherCart->items()->count())->toBe(1);
});

it('charges flat shipping below the threshold and none above it', function (): void {
    Setting::put('shipping_flat_rate_minor', 600);
    Setting::put('free_shipping_threshold_minor', 5000);

    $this->post(route('cart.store'), ['product_id' => $this->product->id, 'quantity' => 2]);

    $this->get(route('cart.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('cart.totals.subtotalMinor', 3160)
            ->where('cart.totals.shippingMinor', 600)
            ->where('cart.totals.totalMinor', 3760)
            ->where('cart.totals.hasFreeShipping', false)
            ->where('cart.totals.freeShippingRemainingMinor', 1840)
        );

    $this->post(route('cart.store'), ['product_id' => $this->product->id, 'quantity' => 2]);

    $this->get(route('cart.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('cart.totals.subtotalMinor', 6320)
            ->where('cart.totals.shippingMinor', 0)
            ->where('cart.totals.hasFreeShipping', true)
        );
});

it('never charges shipping on an empty basket', function (): void {
    Setting::put('shipping_flat_rate_minor', 600);

    $this->get(route('cart.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('cart.totals.shippingMinor', 0)
            ->where('cart.totals.totalMinor', 0)
        );
});

it('adopts a guest cart at login', function (): void {
    $user = User::factory()->create(['password' => 'password']);

    $this->post(route('cart.store'), ['product_id' => $this->product->id, 'quantity' => 2]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);

    // Claimed outright rather than copied, so the row count is unchanged.
    expect(Cart::query()->count())->toBe(1)
        ->and(Cart::query()->firstOrFail()->user_id)->toBe($user->id);
});

it('does not share a cart to the admin console', function (): void {
    $this->actingAs(User::factory()->create(['is_admin' => true]))
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page->missing('cart'));
});
