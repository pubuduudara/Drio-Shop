<?php

declare(strict_types=1);

namespace App\Http\Controllers\Storefront;

use App\Actions\Checkout\PlaceOrder;
use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Support\CartManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

/**
 * Checkout and order confirmation (§7.12).
 *
 * One route, four steps. The steps are a front-end concern — a customer moving
 * between Contact and Shipping should not cost a round trip — and the whole
 * form is validated and written in a single request at the end, so there is no
 * half-created order to reconcile if someone closes the tab on step three.
 */
final class CheckoutController extends Controller
{
    /**
     * Where a placed order's number is parked so its confirmation page can be
     * read once. A guest has no account to look an order up in, and an order
     * number in a URL with no gate would let anyone enumerate them.
     */
    private const string CONFIRMED_ORDER_SESSION_KEY = 'checkout.confirmed_order';

    public function __construct(private readonly CartManager $carts) {}

    public function show(): Response|RedirectResponse
    {
        $cart = $this->carts->current();

        // Nothing to check out. The cart page says so properly, with
        // suggestions; this route should not try to say it a second way.
        if ($cart === null || $cart->items()->doesntExist()) {
            return to_route('cart.index');
        }

        return Inertia::render('storefront/checkout/index', [
            'prefectures' => CheckoutRequest::PREFECTURES,
            'paymentMethods' => CheckoutRequest::PAYMENT_METHODS,
        ]);
    }

    public function store(CheckoutRequest $request, PlaceOrder $placeOrder): RedirectResponse
    {
        $cart = $this->carts->current();

        if ($cart === null || $cart->items()->doesntExist()) {
            return to_route('cart.index');
        }

        try {
            $order = $placeOrder->handle(
                $cart,
                $request->validated(),
                $request->user()?->id,
            );
        } catch (RuntimeException $exception) {
            /*
             * Stock ran out between the review step and the submit. Say which
             * problem it is and send them back to the cart to fix it — an
             * "unexpected error" here loses the sale.
             */
            return to_route('cart.index')->withErrors([
                'checkout' => __('storefront.checkout.'.$exception->getMessage()),
            ]);
        }

        $request->session()->put(self::CONFIRMED_ORDER_SESSION_KEY, $order->order_number);

        return to_route('checkout.confirmation', $order);
    }

    /**
     * The confirmation page (§7.12).
     *
     * Readable by whoever just placed the order, or by the account that owns
     * it. Both checks are deliberate: the session key covers guest checkout,
     * and the ownership check means a signed-in customer can still reach their
     * confirmation after the session key is gone.
     */
    public function confirmation(Request $request, Order $order): Response
    {
        $placedInThisSession = $request->session()->get(self::CONFIRMED_ORDER_SESSION_KEY)
            === $order->order_number;

        $ownsOrder = $request->user() !== null
            && $order->user_id === $request->user()->id;

        abort_unless($placedInThisSession || $ownsOrder, 404);

        return Inertia::render('storefront/checkout/confirmation', [
            'order' => new OrderResource($order->load('items')),
        ]);
    }
}
