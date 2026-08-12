<?php

declare(strict_types=1);

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\SubscribeRequest;
use App\Models\Subscriber;
use Illuminate\Http\RedirectResponse;

final class SubscriberController extends Controller
{
    /**
     * Records a newsletter signup (§7.10).
     *
     * The locale is stored alongside the address so a future campaign can be
     * sent in the language the person was reading when they signed up.
     */
    public function store(SubscribeRequest $request): RedirectResponse
    {
        Subscriber::query()->create([
            'email' => $request->validated('email'),
            'locale' => app()->getLocale(),
            'confirmed_at' => now(),
        ]);

        return back()->with('success', __('storefront.newsletter.subscribed'));
    }
}
