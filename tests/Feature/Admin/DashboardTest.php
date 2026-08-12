<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

/**
 * The console landing page (§8).
 */
beforeEach(function (): void {
    $this->admin = User::factory()->create(['is_admin' => true]);
});

it('counts only paid orders from this month towards revenue', function (): void {
    Order::factory()->create(['status' => OrderStatus::Paid, 'total_minor' => 5000]);
    Order::factory()->create(['status' => OrderStatus::Delivered, 'total_minor' => 3000]);
    // Neither of these is money in the bank.
    Order::factory()->create(['status' => OrderStatus::Pending, 'total_minor' => 9000]);
    Order::factory()->create(['status' => OrderStatus::Cancelled, 'total_minor' => 7000]);
    // Paid, but last month.
    Order::factory()->create([
        'status' => OrderStatus::Paid,
        'total_minor' => 12000,
        'created_at' => now()->subMonth()->startOfMonth(),
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/dashboard')
            ->where('revenue.totalMinor', 8000)
            ->where('revenue.orderCount', 2)
        );
});

it('reports every order status, including the empty ones', function (): void {
    $this->actingAs($this->admin)
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('ordersByStatus', count(OrderStatus::cases()))
            ->where('ordersByStatus.0.count', 0)
        );
});

it('warns about active products at or below the low-stock line', function (): void {
    Product::factory()->create(['stock_quantity' => 3, 'is_active' => true]);
    Product::factory()->create(['stock_quantity' => 50, 'is_active' => true]);
    // Inactive products are not on sale, so they cannot run out.
    Product::factory()->create(['stock_quantity' => 1, 'is_active' => false]);

    $this->actingAs($this->admin)
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('lowStock', 1)
            ->where('lowStock.0.stockQuantity', 3)
        );
});
