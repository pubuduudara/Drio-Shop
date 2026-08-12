<?php

use App\Support\CartManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\RouteCollection;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/**
 * Enables a set of locales and rebuilds the route table, which is what the
 * framework does at boot.
 *
 * Changing `locales.enabled` alone is not enough: App\Support\LocalizedRoutes
 * reads it while registering routes, so a test that skips this step asserts
 * against the route table built from the original locale list.
 *
 * The `web` group is not decoration. `bootstrap/app.php` registers
 * `routes/web.php` through `withRouting(web: ...)`, which wraps the file in
 * that group; a bare `require` here would rebuild the table without it. The
 * routes would still match, so parameterless pages would look fine — but with
 * no SubstituteBindings every model-bound route receives its parameter as a
 * raw string and the container hands the controller an empty model instead.
 * That fails silently as a blank page rather than loudly as an error.
 *
 * @param  list<string>  $enabled
 */
function withLocales(array $enabled): void
{
    config()->set('locales.enabled', $enabled);

    $router = app('router');
    $router->setRoutes(new RouteCollection);

    $router->middleware('web')->group(base_path('routes/web.php'));

    $router->getRoutes()->refreshNameLookups();
}

/**
 * Gives the test client a stable guest-cart cookie.
 *
 * The Laravel test client does not feed a response's cookies back into the
 * next request, so a guest cart — which a browser keys by the `drio_cart`
 * cookie — would otherwise start empty on every call. Setting the cookie once
 * mirrors what a browser does for the whole visit.
 */
function withGuestCart(string $token = 'test-guest-cart'): string
{
    test()->withUnencryptedCookie(CartManager::COOKIE, $token);

    return $token;
}
