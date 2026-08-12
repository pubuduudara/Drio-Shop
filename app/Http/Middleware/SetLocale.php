<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\Locales;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\View;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves the active locale for a storefront request and makes it visible to
 * every layer that needs it: the app locale, the root template's <html>
 * attributes, and the Inertia props the front end reads (§9.2).
 *
 * The locale comes from the route group that matched, not from the URL text,
 * so an unenabled prefix never reaches this middleware — it simply matches no
 * route and 404s.
 */
final class SetLocale
{
    /**
     * @param  Closure(Request): Response  $next
     * @param  string|null  $locale  Stamped by LocalizedRoutes on the group that matched.
     */
    public function handle(Request $request, Closure $next, ?string $locale = null): Response
    {
        $locale = $this->resolveLocale($locale);

        App::setLocale($locale);
        URL::defaults(['locale' => $locale]);

        $meta = Locales::meta($locale);

        View::share('htmlLang', str_replace('_', '-', $locale));
        View::share('htmlDir', $meta['dir']);
        View::share('htmlLocaleClass', $meta['font'] === 'cjk' ? "locale-{$locale}" : '');

        Inertia::share([
            'locale' => $locale,
            'defaultLocale' => Locales::default(),
            'enabledLocales' => Locales::enabled(),
            'localeMeta' => Locales::enabledMeta(),
        ]);

        return $next($request);
    }

    /**
     * Prefer the locale stamped on the matched route group; fall back to the
     * configured default so the middleware is safe to attach anywhere.
     *
     * A locale that is no longer enabled falls back rather than being trusted,
     * so removing one from config cannot leave a route serving it.
     */
    private function resolveLocale(?string $locale): string
    {
        return $locale !== null && Locales::isEnabled($locale)
            ? $locale
            : Locales::default();
    }
}
