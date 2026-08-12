<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CategoryReorderController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\HeroSlideController;
use App\Http\Controllers\Admin\HeroSlideMediaController;
use App\Http\Controllers\Admin\HeroSlideReorderController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductBulkActionController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductMediaController;
use App\Http\Controllers\Admin\ProductQuickUpdateController;
use App\Http\Controllers\Admin\RecipeController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SubscriberController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Console Routes
|--------------------------------------------------------------------------
|
| Mounted at /admin behind auth + the `access-admin` gate (§8). Never wrapped
| in LocalizedRoutes: the console is a work tool with one interface language,
| and its content is authored in every locale rather than read in one.
|
| Models bind on `{model:id}` rather than on their slug. The storefront's route
| key is the slug by design, but an operator renaming a product should not
| change the URL of the form they are editing it in.
|
*/

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'can:access-admin'])
    ->group(function (): void {
        Route::get('/', DashboardController::class)->name('dashboard');

        /*
         * Declared before the resource routes: `products/bulk` would otherwise
         * be swallowed by `products/{product}`.
         */
        Route::patch('products/bulk', ProductBulkActionController::class)
            ->name('products.bulk');

        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::get('products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::get('products/{product:id}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::put('products/{product:id}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product:id}', [ProductController::class, 'destroy'])->name('products.destroy');

        Route::patch('products/{product:id}/quick', ProductQuickUpdateController::class)
            ->name('products.quick-update');

        Route::post('products/{product:id}/media', [ProductMediaController::class, 'store'])
            ->name('products.media.store');
        Route::patch('products/{product:id}/media', [ProductMediaController::class, 'update'])
            ->name('products.media.update');
        Route::delete('products/{product:id}/media/{media:id}', [ProductMediaController::class, 'destroy'])
            ->name('products.media.destroy');

        Route::patch('categories/reorder', CategoryReorderController::class)
            ->name('categories.reorder');

        Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('categories/create', [CategoryController::class, 'create'])->name('categories.create');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::get('categories/{category:id}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::put('categories/{category:id}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category:id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        /*
         * Orders are read and transitioned, never created or deleted from the
         * console — an order is a record of something that happened.
         */
        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order:id}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order:id}/status', [OrderController::class, 'updateStatus'])
            ->name('orders.status');
        Route::get('orders/{order:id}/packing-slip', [OrderController::class, 'packingSlip'])
            ->name('orders.packing-slip');

        Route::get('recipes', [RecipeController::class, 'index'])->name('recipes.index');
        Route::get('recipes/create', [RecipeController::class, 'create'])->name('recipes.create');
        Route::post('recipes', [RecipeController::class, 'store'])->name('recipes.store');
        Route::get('recipes/{recipe:id}/edit', [RecipeController::class, 'edit'])->name('recipes.edit');
        Route::put('recipes/{recipe:id}', [RecipeController::class, 'update'])->name('recipes.update');
        Route::delete('recipes/{recipe:id}', [RecipeController::class, 'destroy'])->name('recipes.destroy');

        Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index');
        Route::patch('reviews/{review:id}/moderate', [ReviewController::class, 'moderate'])
            ->name('reviews.moderate');
        Route::put('reviews/{review:id}', [ReviewController::class, 'update'])->name('reviews.update');
        Route::delete('reviews/{review:id}', [ReviewController::class, 'destroy'])->name('reviews.destroy');

        Route::patch('hero-slides/reorder', HeroSlideReorderController::class)
            ->name('hero-slides.reorder');
        Route::get('hero-slides', [HeroSlideController::class, 'index'])->name('hero-slides.index');
        Route::get('hero-slides/create', [HeroSlideController::class, 'create'])->name('hero-slides.create');
        Route::post('hero-slides', [HeroSlideController::class, 'store'])->name('hero-slides.store');
        Route::get('hero-slides/{heroSlide:id}/edit', [HeroSlideController::class, 'edit'])->name('hero-slides.edit');
        Route::put('hero-slides/{heroSlide:id}', [HeroSlideController::class, 'update'])->name('hero-slides.update');
        Route::delete('hero-slides/{heroSlide:id}', [HeroSlideController::class, 'destroy'])->name('hero-slides.destroy');

        Route::post('hero-slides/{heroSlide:id}/media', [HeroSlideMediaController::class, 'store'])
            ->name('hero-slides.media.store');
        Route::delete('hero-slides/{heroSlide:id}/media', [HeroSlideMediaController::class, 'destroy'])
            ->name('hero-slides.media.destroy');

        Route::get('subscribers', [SubscriberController::class, 'index'])->name('subscribers.index');
        Route::get('subscribers/export', [SubscriberController::class, 'export'])->name('subscribers.export');

        Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
        Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
    });
