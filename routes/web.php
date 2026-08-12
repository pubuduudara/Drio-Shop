<?php

declare(strict_types=1);

use App\Support\LocalizedRoutes;
use Illuminate\Support\Facades\Route;

/*
 * Storefront — public, locale-aware. LocalizedRoutes registers the group once
 * per enabled locale: unprefixed for the default, `/{locale}`-prefixed for the
 * rest (§9.2).
 */
LocalizedRoutes::group(function (): void {
    require __DIR__.'/storefront.php';
});

/*
 * Admin console — authenticated, never localised by URL, and deliberately kept
 * out of the storefront's layout and navigation (§8).
 */
require __DIR__.'/admin.php';

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
