<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

/**
 * The Media tab of the product form (§8): upload, reorder, set primary.
 */
beforeEach(function (): void {
    Storage::fake('public');

    $this->admin = User::factory()->create(['is_admin' => true]);
    $this->product = Product::factory()->create();
});

it('uploads into the gallery and seeds the primary collection from the first image', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.products.media.store', $this->product), [
            'images' => [
                UploadedFile::fake()->image('jackfruit.jpg'),
                UploadedFile::fake()->image('jackfruit-2.jpg'),
            ],
        ])
        ->assertRedirect();

    $this->product->refresh();

    expect($this->product->getMedia('gallery'))->toHaveCount(2)
        // The single-file `primary` collection is what the storefront card
        // reads, so a product is never saved with a gallery and no card image.
        ->and($this->product->getMedia('primary'))->toHaveCount(1)
        ->and($this->product->getMedia('primary')->first()->file_name)
        ->toBe('jackfruit.jpg')
        // The copy records which gallery row it came from, so the tab can mark
        // the right tile and a delete can take the copy with it.
        ->and($this->product->getMedia('primary')->first()->getCustomProperty('source_media_id'))
        ->toBe($this->product->getMedia('gallery')->first()->id);
});

it('reorders the gallery and moves the primary to the chosen image', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.products.media.store', $this->product), [
            'images' => [
                UploadedFile::fake()->image('one.jpg'),
                UploadedFile::fake()->image('two.jpg'),
            ],
        ]);

    $gallery = $this->product->refresh()->getMedia('gallery');
    $second = $gallery->last();

    $this->actingAs($this->admin)
        ->patch(route('admin.products.media.update', $this->product), [
            'order' => [$second->id, $gallery->first()->id],
            'primary_id' => $second->id,
        ])
        ->assertRedirect();

    $this->product->refresh();

    expect($this->product->getMedia('gallery')->first()->id)->toBe($second->id)
        ->and($this->product->getMedia('primary'))->toHaveCount(1)
        ->and($this->product->getMedia('primary')->first()->file_name)->toBe('two.jpg');
});

it('rejects a non-image upload', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.products.media.store', $this->product), [
            'images' => [UploadedFile::fake()->create('prices.pdf', 100, 'application/pdf')],
        ])
        ->assertSessionHasErrors('images.0');

    expect($this->product->refresh()->getMedia('gallery'))->toHaveCount(0);
});

it('refuses to delete media that belongs to another product', function (): void {
    $other = Product::factory()->create();

    $this->actingAs($this->admin)
        ->post(route('admin.products.media.store', $other), [
            'images' => [UploadedFile::fake()->image('other.jpg')],
        ]);

    $media = $other->refresh()->getMedia('gallery')->first();

    $this->actingAs($this->admin)
        ->delete(route('admin.products.media.destroy', [$this->product, $media]))
        ->assertNotFound();

    expect($other->refresh()->getMedia('gallery'))->toHaveCount(1);
});

it('takes the orphaned primary copy with the gallery image it came from', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.products.media.store', $this->product), [
            'images' => [
                UploadedFile::fake()->image('first.jpg'),
                UploadedFile::fake()->image('second.jpg'),
            ],
        ]);

    $gallery = $this->product->refresh()->getMedia('gallery');
    $primarySource = $gallery->first();

    $this->actingAs($this->admin)
        ->delete(route('admin.products.media.destroy', [$this->product, $primarySource]))
        ->assertRedirect();

    $this->product->refresh();

    /*
     * Without this, the tab showed an empty primary marker while the storefront
     * card kept rendering the deleted photograph.
     */
    expect($this->product->getMedia('gallery'))->toHaveCount(1)
        ->and($this->product->getMedia('primary'))->toHaveCount(1)
        ->and($this->product->getMedia('primary')->first()->file_name)->toBe('second.jpg');
});

it('leaves no primary behind when the last gallery image goes', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.products.media.store', $this->product), [
            'images' => [UploadedFile::fake()->image('only.jpg')],
        ]);

    $only = $this->product->refresh()->getMedia('gallery')->first();

    $this->actingAs($this->admin)
        ->delete(route('admin.products.media.destroy', [$this->product, $only]));

    $this->product->refresh();

    // Back to the labelled placeholder, not a deleted image (§3).
    expect($this->product->getMedia('gallery'))->toHaveCount(0)
        ->and($this->product->getMedia('primary'))->toHaveCount(0);
});

it('hands the form the gallery row the primary came from', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.products.media.store', $this->product), [
            'images' => [UploadedFile::fake()->image('one.jpg')],
        ]);

    $galleryId = $this->product->refresh()->getMedia('gallery')->first()->id;

    $this->actingAs($this->admin)
        ->get(route('admin.products.edit', $this->product))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('product.primaryMediaId', $galleryId)
        );
});

/*
 * A `primary` row that is not a copy of a live `gallery` row: no code path
 * in this app can currently write one (every write to `primary` goes
 * through makePrimary(), which always sets source_media_id), but a leftover
 * from data written outside that flow must still not render — the admin
 * Media tab is gallery-only, so an operator has no way to see or remove it.
 */
it('does not resolve an orphaned primary that has no matching gallery row', function (): void {
    $this->product->addMedia(UploadedFile::fake()->image('stray.jpg'))
        ->toMediaCollection('primary');

    expect($this->product->refresh()->primaryImage())->toBeNull();
});

it('does not resolve a primary whose source gallery row is gone', function (): void {
    $this->actingAs($this->admin)->post(route('admin.products.media.store', $this->product), [
        'images' => [UploadedFile::fake()->image('one.jpg')],
    ]);

    $galleryId = $this->product->refresh()->getMedia('gallery')->first()->id;

    // Delete the gallery row directly, bypassing the controller's cascade —
    // exactly what leaves the `primary` copy orphaned.
    \Spatie\MediaLibrary\MediaCollections\Models\Media::find($galleryId)->delete();

    expect($this->product->refresh()->primaryImage())->toBeNull();
});

it('keeps an orphaned primary off the storefront card and detail page', function (): void {
    $this->product->update(['is_active' => true]);
    $this->product->addMedia(UploadedFile::fake()->image('stray.jpg'))
        ->toMediaCollection('primary');
    $this->product->refresh();

    $this->get(route('shop'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where(
                'products.data.0.media',
                fn (?array $media): bool => $media === null,
            )
        );

    $this->get(route('products.show', $this->product))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('product.gallery.0', fn (?array $item): bool => $item === null)
        );
});
