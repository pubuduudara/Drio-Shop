<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * The two build-phase deliverable pages: a token proof sheet (Phase 0) and the
 * design system catalogue (Phase 1). Both are internal review surfaces, so
 * `routes/storefront.php` keeps them out of production.
 */
final class DesignController extends Controller
{
    /**
     * Phase 0 deliverable — proves tokens, fonts and dictionary-sourced
     * strings all resolve. The server-translated line demonstrates that
     * `lang/en/` is wired alongside the client dictionaries.
     */
    public function tokens(): Response
    {
        return Inertia::render('storefront/design/tokens', [
            'serverGreeting' => __('storefront.tokens.server_string', [
                'locale' => app()->getLocale(),
            ]),
        ]);
    }

    /**
     * Phase 1 deliverable — every primitive in every variant and state.
     */
    public function system(): Response
    {
        return Inertia::render('storefront/design/system');
    }
}
