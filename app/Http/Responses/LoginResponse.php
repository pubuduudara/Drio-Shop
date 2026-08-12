<?php

declare(strict_types=1);

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

/**
 * Where a successful login lands.
 *
 * Admins go straight to the console rather than to the account dashboard —
 * signing in is something the client does to get to their products, not to
 * look at their profile (§8). Everyone else keeps Fortify's configured home.
 */
final class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse|JsonResponse
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 204);
        }

        return redirect()->intended($this->home($request));
    }

    private function home(Request $request): string
    {
        return $request->user()?->can('access-admin')
            ? route('admin.dashboard', absolute: false)
            : config('fortify.home');
    }
}
