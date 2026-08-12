<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * The one way anything reaches the cart (§6).
 *
 * A cart is keyed by user once authenticated, and by an opaque guest token
 * before that. Both columns are nullable so signing in adopts the guest cart
 * by setting `user_id` rather than copying rows — the customer's basket
 * survives login without a merge in the common case.
 *
 * The guest token lives in its own long-lived cookie rather than being the
 * session id. A session expires in hours and regenerates on login; a basket
 * someone filled last night should still be there this morning, and tying it
 * to the session throws it away on both events. `carts.session_id` holds that
 * token — the column keeps the name §6 gave it, but what it stores is this
 * cookie's value, never `sessions.id`.
 *
 * Quantities are clamped to what is actually in stock here rather than at each
 * call site: a product can sell out between the page render and the click, and
 * the cart must never hold more units than can be shipped.
 */
final class CartManager
{
    /** Nobody needs 100 of anything, and it caps abuse of the endpoint. */
    public const int MAX_QUANTITY_PER_LINE = 99;

    /**
     * Unencrypted, like `appearance` and `sidebar_state`: the value is an
     * opaque random token that identifies no one and protects nothing.
     */
    public const string COOKIE = 'drio_cart';

    private const int COOKIE_LIFETIME_MINUTES = 60 * 24 * 30;

    public function __construct(private readonly Request $request) {}

    /**
     * The current cart, or null when this visitor has never added anything.
     * Reading must not create a row — the header asks on every request.
     */
    public function current(): ?Cart
    {
        $user = $this->request->user();

        if ($user !== null) {
            return Cart::query()->where('user_id', $user->id)->first();
        }

        $token = $this->guestToken();

        return $token === null
            ? null
            : Cart::query()->whereNull('user_id')->where('session_id', $token)->first();
    }

    public function currentOrCreate(): Cart
    {
        $existing = $this->current();

        if ($existing !== null) {
            return $existing;
        }

        $user = $this->request->user();

        if ($user !== null) {
            return Cart::query()->create([
                'user_id' => $user->id,
                'currency' => Setting::currency(),
            ]);
        }

        $token = $this->guestToken() ?? $this->issueGuestToken();

        return Cart::query()->create([
            'session_id' => $token,
            'currency' => Setting::currency(),
        ]);
    }

    /**
     * Adds units, or tops up the line that already holds this product.
     *
     * Returns the quantity actually stored, which may be lower than asked for
     * when stock ran out — the caller reports that rather than silently
     * accepting an order it cannot fill.
     */
    public function add(Product $product, int $quantity = 1): int
    {
        $cart = $this->currentOrCreate();

        $item = $cart->items()->firstOrNew(['product_id' => $product->id]);
        $requested = ($item->quantity ?? 0) + $quantity;

        $item->quantity = $this->clamp($requested, $product);
        // Re-read from the product, so a repriced item updates rather than
        // holding whatever it cost when it was first added.
        $item->unit_price_minor = $product->price_minor;
        $item->save();

        return $item->quantity;
    }

    /** Zero or less removes the line — a stepper at 1 pressing minus empties it. */
    public function setQuantity(CartItem $item, int $quantity): void
    {
        if ($quantity < 1) {
            $item->delete();

            return;
        }

        $item->update([
            'quantity' => $this->clamp($quantity, $item->product),
            'unit_price_minor' => $item->product->price_minor,
        ]);
    }

    public function remove(CartItem $item): void
    {
        $item->delete();
    }

    public function clear(): void
    {
        $this->current()?->items()->delete();
    }

    /**
     * Adopts the guest cart at login (§6).
     *
     * The guest cart is claimed outright when the account has none. When both
     * exist the lines are folded together and the guest cart dropped, because
     * losing what someone just put in their basket to sign in is the worst
     * possible moment to lose it.
     */
    public function adoptGuestCart(int $userId): void
    {
        $token = $this->guestToken();

        if ($token === null) {
            return;
        }

        $guestCart = Cart::query()
            ->whereNull('user_id')
            ->where('session_id', $token)
            ->with('items')
            ->first();

        if ($guestCart === null) {
            return;
        }

        $userCart = Cart::query()->where('user_id', $userId)->first();

        if ($userCart === null) {
            $guestCart->update(['user_id' => $userId, 'session_id' => null]);

            return;
        }

        DB::transaction(function () use ($guestCart, $userCart): void {
            foreach ($guestCart->items as $item) {
                $existing = $userCart->items()
                    ->where('product_id', $item->product_id)
                    ->first();

                if ($existing === null) {
                    $userCart->items()->create([
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                        'unit_price_minor' => $item->unit_price_minor,
                    ]);

                    continue;
                }

                $existing->update([
                    'quantity' => min(
                        $existing->quantity + $item->quantity,
                        self::MAX_QUANTITY_PER_LINE,
                    ),
                ]);
            }

            $guestCart->delete();
        });
    }

    /**
     * The token from the request cookie, or the one issued earlier in this
     * same request — a queued cookie is not readable from the request, so two
     * writes in one request would otherwise create two carts.
     */
    private function guestToken(): ?string
    {
        $token = $this->request->cookie(self::COOKIE);

        return is_string($token) && $token !== '' ? $token : null;
    }

    private function issueGuestToken(): string
    {
        $token = Str::random(40);

        Cookie::queue(
            Cookie::make(self::COOKIE, $token, self::COOKIE_LIFETIME_MINUTES)
        );

        // Readable by `guestToken()` for the rest of this request.
        $this->request->cookies->set(self::COOKIE, $token);

        return $token;
    }

    /**
     * Never more than the shelf holds, and never more than the per-line cap.
     */
    private function clamp(int $quantity, Product $product): int
    {
        return max(1, min($quantity, $product->stock_quantity, self::MAX_QUANTITY_PER_LINE));
    }
}
