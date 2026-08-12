<?php

namespace App\Http\Middleware;

use App\Http\Resources\CartResource;
use App\Support\CartManager;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',

            /*
             * The admin console renders no bag and no drawer, so it is not
             * given a cart to pay for. A closure would not help — Inertia
             * resolves regular props on every full visit either way; the
             * saving is in not declaring it at all.
             */
            ...($request->routeIs('admin.*') ? [] : ['cart' => $this->cart($request)]),
        ];
    }

    /**
     * The cart every storefront page needs: the header's bag badge is on all of
     * them, and the drawer can open anywhere (§7.1).
     *
     * A visitor with no cart row gets the empty shape rather than null, so no
     * component has to guard the prop before reading `count`.
     *
     * @return array<string, mixed>
     */
    private function cart(Request $request): array
    {
        $cart = (new CartManager($request))->current();

        if ($cart === null) {
            return CartResource::empty();
        }

        // Eager-loaded here rather than in the resource: without it a basket of
        // eight lines is nine queries on every single page.
        $cart->load('items.product');

        return (new CartResource($cart))->resolve();
    }
}
