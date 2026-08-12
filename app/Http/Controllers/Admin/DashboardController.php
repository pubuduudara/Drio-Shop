<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ProductRowResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The console landing page (§8): revenue this month, orders by status,
 * low-stock warnings, recent orders and best sellers.
 *
 * Orders arrive with Phase 6, so the order panels render their empty states
 * against an empty table today rather than being absent from the page — the
 * shape of the dashboard should not change when data starts flowing.
 */
final class DashboardController extends Controller
{
    private const int RECENT_ORDER_LIMIT = 8;

    private const int LOW_STOCK_LIMIT = 8;

    private const int BEST_SELLER_LIMIT = 5;

    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'revenue' => $this->revenueThisMonth(),
            'ordersByStatus' => $this->ordersByStatus(),
            'lowStock' => ProductRowResource::collection($this->lowStockProducts()),
            'recentOrders' => $this->recentOrders(),
            'bestSellers' => $this->bestSellers(),
            'catalogue' => [
                'activeProducts' => Product::query()->active()->count(),
                'inactiveProducts' => Product::query()->where('is_active', false)->count(),
            ],
        ]);
    }

    /**
     * @return array{totalMinor: int, currency: string, orderCount: int}
     */
    private function revenueThisMonth(): array
    {
        $orders = Order::query()
            ->paid()
            ->where('created_at', '>=', now()->startOfMonth());

        return [
            'totalMinor' => (int) $orders->clone()->sum('total_minor'),
            'currency' => (string) Setting::get('currency', 'JPY'),
            'orderCount' => $orders->clone()->count(),
        ];
    }

    /**
     * Every status, including the ones with no orders — a dashboard that hides
     * empty buckets makes "no cancellations" indistinguishable from "the panel
     * is broken".
     *
     * @return list<array{status: string, count: int}>
     */
    private function ordersByStatus(): array
    {
        $counts = Order::query()
            ->select('status', DB::raw('count(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        return array_map(
            fn (OrderStatus $status): array => [
                'status' => $status->value,
                'count' => (int) ($counts[$status->value] ?? 0),
            ],
            OrderStatus::cases(),
        );
    }

    /**
     * @return Collection<int, Product>
     */
    private function lowStockProducts(): Collection
    {
        return Product::query()
            ->with('category')
            ->active()
            ->where('stock_quantity', '<', Product::LOW_STOCK_THRESHOLD)
            ->orderBy('stock_quantity')
            ->take(self::LOW_STOCK_LIMIT)
            ->get();
    }

    /**
     * @return list<array{id: int, orderNumber: string, customerName: string, status: string, totalMinor: int, currency: string, placedAt: string}>
     */
    private function recentOrders(): array
    {
        return Order::query()
            ->latest()
            ->take(self::RECENT_ORDER_LIMIT)
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'orderNumber' => $order->order_number,
                'customerName' => $order->customer_name,
                'status' => $order->status->value,
                'totalMinor' => $order->total_minor,
                'currency' => $order->currency,
                'placedAt' => $order->created_at?->toDateString() ?? '',
            ])
            ->all();
    }

    /**
     * Units sold per product, from the order line snapshots. Falls back to
     * nothing rather than to the `is_best_seller` flag: that flag is an
     * editorial choice about the homepage, not a sales figure.
     *
     * @return list<array{id: int, name: string, unitsSold: int}>
     */
    private function bestSellers(): array
    {
        return OrderItem::query()
            ->select('product_id', 'product_name_snapshot', DB::raw('sum(quantity) as units_sold'))
            ->whereNotNull('product_id')
            ->groupBy('product_id', 'product_name_snapshot')
            ->orderByDesc('units_sold')
            ->take(self::BEST_SELLER_LIMIT)
            ->with('product')
            ->get()
            ->map(fn (OrderItem $item): array => [
                'id' => (int) $item->product_id,
                // The live name when the product still exists, the snapshot
                // when it has been deleted from the catalogue.
                'name' => $item->product?->name ?? $item->product_name_snapshot,
                'unitsSold' => (int) $item->getAttribute('units_sold'),
            ])
            ->all();
    }
}
