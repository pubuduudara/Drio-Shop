<?php

declare(strict_types=1);

use App\Http\Controllers\DesignController;
use App\Http\Controllers\Storefront\CartController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\HomeController;
use App\Http\Controllers\Storefront\PageController;
use App\Http\Controllers\Storefront\ProductController;
use App\Http\Controllers\Storefront\RecipeController;
use App\Http\Controllers\Storefront\ShopController;
use App\Http\Controllers\Storefront\SubscriberController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront Routes
|--------------------------------------------------------------------------
|
| Registered once per enabled locale by App\Support\LocalizedRoutes, so this
| file never mentions a locale, a prefix or a language-specific name. See
| §9.2 for the URL strategy.
|
| Models bind on their slug, which is deliberately not translatable: one
| canonical URL per record, shared by every locale (§6).
|
*/

Route::get('/', HomeController::class)->name('home');

Route::get('shop', [ShopController::class, 'index'])->name('shop');
Route::get('categories/{category}', [ShopController::class, 'category'])->name('categories.show');
Route::get('products/{product}', ProductController::class)->name('products.show');

Route::get('recipes', [RecipeController::class, 'index'])->name('recipes.index');
Route::get('recipes/{recipe}', [RecipeController::class, 'show'])->name('recipes.show');

/*
 * Cart and checkout (§7.12). The cart itself reaches every page as a shared
 * Inertia prop, so these endpoints only mutate and redirect back.
 */
Route::get('cart', [CartController::class, 'index'])->name('cart.index');
Route::post('cart', [CartController::class, 'store'])->name('cart.store');
Route::patch('cart/items/{item}', [CartController::class, 'update'])->name('cart.items.update');
Route::delete('cart/items/{item}', [CartController::class, 'destroy'])->name('cart.items.destroy');

Route::get('checkout', [CheckoutController::class, 'show'])->name('checkout.show');
Route::post('checkout', [CheckoutController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('checkout.store');
Route::get('orders/{order}/confirmation', [CheckoutController::class, 'confirmation'])
    ->name('checkout.confirmation');

Route::get('about', [PageController::class, 'about'])->name('about');
Route::get('contact', [PageController::class, 'contact'])->name('contact');
Route::post('contact', [PageController::class, 'storeContact'])
    ->middleware('throttle:10,1')
    ->name('contact.store');

Route::post('subscribe', [SubscriberController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('subscribe');

/*
 * Build-phase review surfaces. Local and testing only — they document the
 * system for sign-off, they are not part of the storefront.
 */
if (! app()->isProduction()) {
    Route::get('tokens', [DesignController::class, 'tokens'])->name('design.tokens');
    Route::get('design-system', [DesignController::class, 'system'])->name('design.system');
}
