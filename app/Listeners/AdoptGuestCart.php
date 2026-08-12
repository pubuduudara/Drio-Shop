<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Models\User;
use App\Support\CartManager;
use Illuminate\Auth\Events\Login;

/**
 * Carries a guest's basket across the login boundary (§6).
 *
 * The guest cart is keyed by its own cookie rather than by the session id, so
 * this does not have to run before Fortify regenerates the session — the token
 * is the same on both sides of login.
 */
final class AdoptGuestCart
{
    public function __construct(private readonly CartManager $carts) {}

    public function handle(Login $event): void
    {
        if (! $event->user instanceof User) {
            return;
        }

        $this->carts->adoptGuestCart($event->user->id);
    }
}
