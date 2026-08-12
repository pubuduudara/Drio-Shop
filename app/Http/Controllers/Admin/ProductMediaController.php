<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductMediaOrderRequest;
use App\Http\Requests\Admin\ProductMediaRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * The Media tab of the product form (§8): upload, reorder, set primary.
 *
 * Uploads land in the `gallery` collection; `primary` is the single-file
 * collection the storefront card and hero read (§6). Marking a gallery image
 * primary copies it into that collection rather than moving it, so the image
 * stays in the gallery — a product's main shot is almost always also one of its
 * gallery shots, and moving it would silently remove it from the carousel.
 *
 * The copy records which gallery row it came from in a custom property. That
 * link is what lets the tab show which tile is primary, and what lets a delete
 * take the orphaned copy with it.
 */
final class ProductMediaController extends Controller
{
    public function store(ProductMediaRequest $request, Product $product): RedirectResponse
    {
        /** @var list<UploadedFile> $images */
        $images = $request->file('images');
        $hadPrimary = $product->getMedia('primary')->isNotEmpty();

        foreach ($images as $image) {
            $media = $product->addMedia($image)->toMediaCollection('gallery');

            // The first image a product ever gets becomes its primary, so a
            // product is never saved with a gallery and no card image.
            if (! $hadPrimary) {
                $this->makePrimary($product, $media);
                $hadPrimary = true;
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => trans_choice('admin.products.media.uploaded', count($images), ['count' => count($images)]),
        ]);

        return back();
    }

    public function update(ProductMediaOrderRequest $request, Product $product): RedirectResponse
    {
        $gallery = $product->getMedia('gallery');

        /** @var list<int> $order */
        $order = $request->validated('order');

        // Only ids that actually belong to this product's gallery, so a
        // tampered payload cannot reorder another product's media.
        $ownedIds = $gallery->pluck('id')->all();
        $sortable = array_values(array_intersect($order, $ownedIds));

        Media::setNewOrder($sortable);

        $primaryId = $request->validated('primary_id');

        if ($primaryId !== null && in_array((int) $primaryId, $ownedIds, true)) {
            $source = $gallery->firstWhere('id', (int) $primaryId);

            if ($source instanceof Media) {
                $this->makePrimary($product, $source);
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.toast.saved'),
        ]);

        return back();
    }

    public function destroy(Product $product, Media $media): RedirectResponse
    {
        abort_unless(
            $media->model_type === $product::class && (int) $media->model_id === $product->id,
            404,
        );

        $wasPrimarySource = $this->primarySourceId($product) === $media->id;

        $media->delete();

        /*
         * The `primary` copy is its own row, so deleting the gallery tile it
         * came from would otherwise leave it behind: the tab would show an
         * empty gallery while the storefront card kept rendering the deleted
         * photograph. Promote whatever is now first instead, so the card falls
         * back to another image rather than to the placeholder.
         */
        if ($wasPrimarySource) {
            $product->clearMediaCollection('primary');
            $product->load('media');

            $next = $product->getMedia('gallery')->first();

            if ($next instanceof Media) {
                $this->makePrimary($product, $next);
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('admin.products.media.deleted'),
        ]);

        return back();
    }

    /**
     * Copies a gallery image into the single-file `primary` collection and
     * records where it came from.
     *
     * Identified by id rather than by file name: two uploads can share a name,
     * and matching on one would point the tab's Primary marker at the wrong
     * tile and make a delete clear the wrong copy.
     */
    private function makePrimary(Product $product, Media $source): void
    {
        $product->clearMediaCollection('primary');

        $copy = $source->copy($product, 'primary');
        $copy->setCustomProperty(Product::PRIMARY_SOURCE_PROPERTY, $source->id)->save();

        $product->load('media');
    }

    /** The gallery row the current primary was copied from, if any. */
    private function primarySourceId(Product $product): ?int
    {
        $primary = $product->getMedia('primary')->first();

        if (! $primary instanceof Media) {
            return null;
        }

        $id = $primary->getCustomProperty(Product::PRIMARY_SOURCE_PROPERTY);

        return is_numeric($id) ? (int) $id : null;
    }
}
