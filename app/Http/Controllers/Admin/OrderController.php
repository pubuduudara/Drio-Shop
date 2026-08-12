<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\OrderStatusRequest;
use App\Http\Resources\Admin\OrderRowResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Support\Money;
use App\Support\PaginatedPayload;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Order management (§8): list with status and date filters, detail with line
 * items and address, status transitions with a note, and a packing slip.
 */
final class OrderController extends Controller
{
    private const int PER_PAGE = 25;

    public function index(Request $request): Response
    {
        $filters = [
            'search' => trim((string) $request->string('search')),
            'status' => $request->string('status')->toString(),
            'from' => $request->date('from')?->toDateString(),
            'to' => $request->date('to')?->toDateString(),
        ];

        $orders = Order::query()
            ->withSum('items', 'quantity')
            ->when($filters['search'] !== '', function (Builder $query) use ($filters): void {
                $term = '%'.$filters['search'].'%';

                $query->where(function (Builder $query) use ($term): void {
                    $query->where('order_number', 'like', $term)
                        ->orWhere('customer_name', 'like', $term)
                        ->orWhere('customer_email', 'like', $term);
                });
            })
            ->when(
                OrderStatus::tryFrom($filters['status']),
                fn (Builder $query, OrderStatus $status) => $query->where('status', $status->value),
            )
            ->when($filters['from'], fn (Builder $query, string $from) => $query->whereDate('created_at', '>=', $from))
            ->when($filters['to'], fn (Builder $query, string $to) => $query->whereDate('created_at', '<=', $to))
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => PaginatedPayload::make($orders, OrderRowResource::class),
            'filters' => $filters,
            'statuses' => array_map(
                fn (OrderStatus $status): string => $status->value,
                OrderStatus::cases(),
            ),
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('admin/orders/show', [
            'order' => new OrderResource($order->load('items')),
            // Only the moves the enum actually allows from here, so the select
            // cannot offer a transition the request would then reject (§8).
            'allowedTransitions' => array_map(
                fn (OrderStatus $status): string => $status->value,
                $order->status->allowedTransitions(),
            ),
        ]);
    }

    /**
     * Records a status change and its note (§8).
     *
     * The note is appended to the order's `notes` with the transition and a
     * timestamp, which keeps a readable history inside the schema §6 defines.
     * A dedicated events table would be a better audit trail and is the right
     * change to make when someone needs to query it.
     */
    public function updateStatus(OrderStatusRequest $request, Order $order): RedirectResponse
    {
        $target = OrderStatus::from((string) $request->validated('status'));
        $note = $request->validated('note');

        $entry = sprintf(
            '[%s] %s',
            now()->toDateTimeString(),
            __('orders.status_changed', [
                'from' => $order->status->label(),
                'to' => $target->label(),
            ]),
        );

        if (filled($note)) {
            $entry .= ' — '.$note;
        }

        $order->update([
            'status' => $target,
            'notes' => trim($order->notes."\n".$entry),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.orders.status_saved', ['status' => $target->label()]),
        ]);

        return back();
    }

    /**
     * The packing slip (§8).
     *
     * Deliberately a Blade view rather than an Inertia page: it is a document
     * that goes in a box, so it must print identically with no JavaScript and
     * carry its own styles rather than the console's.
     */
    public function packingSlip(Order $order): View
    {
        return view('admin.packing-slip', [
            'order' => $order->load('items'),
            // Bound to this order's currency, so the template never repeats it.
            'money' => fn (int $minor): string => Money::format($minor, $order->currency),
        ]);
    }
}
