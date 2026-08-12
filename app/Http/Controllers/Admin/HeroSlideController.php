<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\HeroSlideRequest;
use App\Http\Resources\Admin\HeroSlideResource;
use App\Models\HeroSlide;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Hero slide management (§8): CRUD with reorder and an active toggle. Headline
 * and subhead go through `<TranslatableField />` like every other translatable
 * field (§9.5).
 */
final class HeroSlideController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/hero-slides/index', [
            'slides' => HeroSlideResource::collection(HeroSlide::query()->ordered()->get()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/hero-slides/create', [
            'nextSortOrder' => (int) HeroSlide::query()->max('sort_order') + 1,
        ]);
    }

    public function store(HeroSlideRequest $request): RedirectResponse
    {
        $slide = HeroSlide::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.heroSlides.created', ['name' => $slide->headline]),
        ]);

        return to_route('admin.hero-slides.index');
    }

    public function edit(HeroSlide $heroSlide): Response
    {
        return Inertia::render('admin/hero-slides/edit', [
            'slide' => new HeroSlideResource($heroSlide),
        ]);
    }

    public function update(HeroSlideRequest $request, HeroSlide $heroSlide): RedirectResponse
    {
        $heroSlide->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('admin.toast.saved')]);

        return back();
    }

    public function destroy(HeroSlide $heroSlide): RedirectResponse
    {
        $headline = $heroSlide->headline;
        $heroSlide->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.heroSlides.deleted', ['name' => $headline]),
        ]);

        return to_route('admin.hero-slides.index');
    }
}
