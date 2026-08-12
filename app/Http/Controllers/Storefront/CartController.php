<?php

declare(strict_types=1);

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\AddToCartRequest;
use App\Http\Requests\Storefront\UpdateCartItemRequest;
use App\Http\Resources\ProductCardResource;
use App\Models\CartItem;
use App\Models\Product;
use App\Support\CartManager;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The cart page and the endpoints behind the drawer (§7.12).
 *
 * The cart itself reaches every page as a shared prop, so none of the write
 * actions return it — they redirect back and the shared prop is re-resolved,
 * which is what keeps the header badge, the drawer and the page in step
 * without any of them owning a copy.
 */
final class CartController extends Controller
{
    private const int SUGGESTION_LIMIT = 4;

    public function __construct(private readonly CartManager $carts) {}

    public function index(): Response
    {
        return Inertia::render('storefront/cart/index', [
            // Something to do when the basket is empty, rather than a dead end.
            'suggestions' => ProductCardResource::collection(
                Product::query()
                    ->active()
                    ->bestSellers()
                    ->ordered()
                    ->withCount('reviews')
                    ->withAvg('reviews', 'rating')
                    ->take(self::SUGGESTION_LIMIT)
                    ->get(),
            ),
        ]);
    }

    public function store(AddToCartRequest $request): RedirectResponse
    {
        $product = Product::query()->findOrFail($request->validated('product_id'));

        if (! $product->isInStock()) {
            return back()->withErrors([
                'quantity' => __('storefront.cart.out_of_stock'),
            ]);
        }

        $stored = $this->carts->add($product, (int) $request->validated('quantity'));

        /*
         * The cart clamps to available stock, so what was asked for and what
         * was stored can differ. Saying so beats a silently smaller basket
         * discovered at checkout.
         */
        if ($stored < (int) $request->validated('quantity')) {
            return back()->withErrors([
                'quantity' => __('storefront.cart.stock_limited', ['count' => $stored]),
            ]);
        }

        return back();
    }

    public function update(UpdateCartItemRequest $request, CartItem $item): RedirectResponse
    {
        $this->authorizeItem($item);

        $this->carts->setQuantity($item, (int) $request->validated('quantity'));

        return back();
    }

    public function destroy(CartItem $item): RedirectResponse
    {
        $this->authorizeItem($item);

        $this->carts->remove($item);

        return back();
    }

    /**
     * A cart item id is a guessable integer, so ownership is checked rather
     * than assumed — otherwise anyone could empty anyone else's basket.
     */
    private function authorizeItem(CartItem $item): void
    {
        abort_unless($item->cart_id === $this->carts->current()?->id, 404);
    }
}
