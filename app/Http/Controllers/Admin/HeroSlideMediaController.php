<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\HeroSlideMediaRequest;
use App\Models\HeroSlide;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

/**
 * The image field of the hero slide form (§8).
 *
 * `primary` is a single-file collection, so a new upload replaces the current
 * image rather than joining a gallery — there is only ever one photograph per
 * slide.
 */
final class HeroSlideMediaController extends Controller
{
    public function store(HeroSlideMediaRequest $request, HeroSlide $heroSlide): RedirectResponse
    {
        $heroSlide->addMediaFromRequest('image')->toMediaCollection('primary');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.toast.saved'),
        ]);

        return back();
    }

    public function destroy(HeroSlide $heroSlide): RedirectResponse
    {
        $heroSlide->clearMediaCollection('primary');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.toast.saved'),
        ]);

        return back();
    }
}
