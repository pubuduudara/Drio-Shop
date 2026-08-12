<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * Admin order management (§8).
 */
beforeEach(function (): void {
    $this->admin = User::factory()->create(['is_admin' => true]);
});

it('lists orders with status, search and date filters', function (): void {
    Order::factory()->create([
        'order_number' => 'DRIO-20260801-AAAAA',
        'customer_name' => 'Niroshi Perera',
        'status' => OrderStatus::Paid,
        'created_at' => now()->subDays(10),
    ]);
    Order::factory()->create([
        'order_number' => 'DRIO-20260808-BBBBB',
        'customer_name' => 'Kenji Sato',
        'status' => OrderStatus::Pending,
        'created_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.orders.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/orders/index')
            ->has('orders.data', 2)
        );

    $this->actingAs($this->admin)
        ->get(route('admin.orders.index', ['status' => 'paid']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.customerName', 'Niroshi Perera')
        );

    $this->actingAs($this->admin)
        ->get(route('admin.orders.index', ['search' => 'Kenji']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.customerName', 'Kenji Sato')
        );

    $this->actingAs($this->admin)
        ->get(route('admin.orders.index', [
            'from' => now()->subDays(2)->toDateString(),
        ]))
        ->assertInertia(fn (AssertableInertia $page) => $page->has('orders.data', 1));
});

it('offers only the transitions the enum allows', function (): void {
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    $this->actingAs($this->admin)
        ->get(route('admin.orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/orders/show')
            ->where('allowedTransitions', ['paid', 'cancelled'])
        );
});

it('records a status change and its note', function (): void {
    $order = Order::factory()->create([
        'status' => OrderStatus::Pending,
        'notes' => '',
    ]);

    $this->actingAs($this->admin)
        ->patch(route('admin.orders.status', $order), [
            'status' => 'paid',
            'note' => 'Bank transfer cleared.',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $order->refresh();

    expect($order->status)->toBe(OrderStatus::Paid)
        ->and($order->notes)->toContain('Pending → Paid')
        ->and($order->notes)->toContain('Bank transfer cleared.');
});

it('refuses a transition the business does not allow', function (): void {
    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);

    $this->actingAs($this->admin)
        ->patch(route('admin.orders.status', $order), ['status' => 'pending'])
        ->assertSessionHasErrors('status');

    expect($order->refresh()->status)->toBe(OrderStatus::Delivered);
});

it('renders a printable packing slip', function (): void {
    $order = Order::factory()->create(['customer_name' => 'Niroshi Perera']);
    $order->items()->create([
        'product_name_snapshot' => 'Dehydrated Jackfruit',
        'sku_snapshot' => 'DRIO-JF-200',
        'unit_price_minor' => 1580,
        'quantity' => 2,
        'line_total_minor' => 3160,
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.orders.packing-slip', $order))
        ->assertOk()
        ->assertSee('Niroshi Perera')
        ->assertSee('DRIO-JF-200')
        ->assertSee($order->order_number);
});

it('keeps a non-admin out of every order endpoint', function (): void {
    $user = User::factory()->create(['is_admin' => false]);
    $order = Order::factory()->create();

    $this->actingAs($user)->get(route('admin.orders.index'))->assertForbidden();
    $this->actingAs($user)->get(route('admin.orders.show', $order))->assertForbidden();
    $this->actingAs($user)
        ->patch(route('admin.orders.status', $order), ['status' => 'paid'])
        ->assertForbidden();
});
