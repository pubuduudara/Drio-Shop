<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewModerationRequest;
use App\Http\Requests\Admin\ReviewRequest;
use App\Http\Resources\Admin\ReviewRowResource;
use App\Models\Review;
use App\Support\PaginatedPayload;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The review moderation queue (§8): approve, unapprove, feature, delete.
 *
 * Unpublished reviews lead the default view, because the queue exists to be
 * emptied — a moderator opening it should see what needs a decision, not the
 * archive.
 */
final class ReviewController extends Controller
{
    private const int PER_PAGE = 20;

    public function index(Request $request): Response
    {
        $filters = ['status' => $request->string('status')->toString()];

        $reviews = Review::query()
            ->with('product')
            ->when($filters['status'] === 'pending', fn (Builder $query) => $query->where('is_published', false))
            ->when($filters['status'] === 'published', fn (Builder $query) => $query->where('is_published', true))
            ->when($filters['status'] === 'featured', fn (Builder $query) => $query->where('is_featured', true))
            ->orderBy('is_published')
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('admin/reviews/index', [
            'reviews' => PaginatedPayload::make($reviews, ReviewRowResource::class),
            'filters' => $filters,
            'pendingCount' => Review::query()->where('is_published', false)->count(),
        ]);
    }

    /** One-click moderation from the queue row (§8). */
    public function moderate(ReviewModerationRequest $request, Review $review): RedirectResponse
    {
        match ($request->validated('action')) {
            'publish' => $review->update(['is_published' => true]),
            // Unpublishing pulls it off the homepage too: a review that is not
            // good enough to show cannot be good enough to feature.
            'unpublish' => $review->update(['is_published' => false, 'is_featured' => false]),
            'feature' => $review->update(['is_published' => true, 'is_featured' => true]),
            'unfeature' => $review->update(['is_featured' => false]),
            default => null,
        };

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.reviews.moderated'),
        ]);

        return back();
    }

    public function update(ReviewRequest $request, Review $review): RedirectResponse
    {
        $review->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.toast.saved'),
        ]);

        return back();
    }

    public function destroy(Review $review): RedirectResponse
    {
        $name = $review->customer_name;
        $review->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.reviews.deleted', ['name' => $name]),
        ]);

        return back();
    }
}
