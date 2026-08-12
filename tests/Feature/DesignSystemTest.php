<?php

declare(strict_types=1);

use Illuminate\Routing\RouteCollection;
use Inertia\Testing\AssertableInertia;

/**
 * Smoke coverage for the two build-phase review surfaces, plus the rule that
 * keeps them out of production.
 */
it('renders the token sheet with a server-translated string', function (): void {
    $this->get('/tokens')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/design/tokens')
            ->where('serverGreeting', __('storefront.tokens.server_string', ['locale' => 'en']))
        );
});

it('renders the design system catalogue', function (): void {
    $this->get('/design-system')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/design/system')
        );
});

it('does not register the review surfaces in production', function (): void {
    app()->detectEnvironment(fn (): string => 'production');

    $router = app('router');
    $router->setRoutes(new RouteCollection);

    require base_path('routes/web.php');

    $router->getRoutes()->refreshNameLookups();

    expect($router->getRoutes()->getByName('design.tokens'))->toBeNull()
        ->and($router->getRoutes()->getByName('design.system'))->toBeNull()
        // The storefront itself is untouched by the guard.
        ->and($router->getRoutes()->getByName('home'))->not->toBeNull();
});
