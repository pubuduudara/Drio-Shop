<?php

declare(strict_types=1);

namespace App\Support;

use App\Http\Middleware\SetLocale;
use Closure;
use Illuminate\Support\Facades\Route;

/**
 * Registers a set of storefront routes once per enabled locale (§9.2).
 *
 * The default locale is registered without a prefix and owns the canonical
 * route names, so `/shop` is `/shop` forever. Every other enabled locale gets
 * a URL prefix and a matching route-name prefix, so `/ja/shop` (named
 * `ja.shop`) begins resolving the day `ja` joins `locales.enabled` — with no
 * edit to the route file and no broken English URLs.
 *
 * A prefix that is present but not enabled matches nothing and 404s, which is
 * the required behaviour rather than an accident of this design.
 */
final class LocalizedRoutes
{
    /**
     * @param  Closure():void  $routes
     */
    public static function group(Closure $routes): void
    {
        foreach (Locales::enabled() as $locale) {
            Route::middleware(SetLocale::class.':'.$locale)
                ->prefix(Locales::urlPrefix($locale))
                ->name(Locales::routeNamePrefix($locale))
                ->group($routes);
        }
    }
}
