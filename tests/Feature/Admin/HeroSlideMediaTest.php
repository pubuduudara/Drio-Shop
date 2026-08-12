<?php

declare(strict_types=1);

use App\Models\HeroSlide;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

/**
 * The image field of the hero slide form (§8): a single-file `primary`
 * collection, uploaded and removed independently of the rest of the form.
 */
beforeEach(function (): void {
    Storage::fake('public');

    $this->admin = User::factory()->create(['is_admin' => true]);
    $this->slide = HeroSlide::factory()->create();
});

it('uploads into the primary collection', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.hero-slides.media.store', $this->slide), [
            'image' => UploadedFile::fake()->image('spread.jpg'),
        ])
        ->assertRedirect();

    $this->slide->refresh();

    expect($this->slide->getMedia('primary'))->toHaveCount(1)
        ->and($this->slide->getMedia('primary')->first()->file_name)->toBe('spread.jpg');
});

it('replaces the current image on a new upload, being a single-file collection', function (): void {
    $this->actingAs($this->admin)->post(route('admin.hero-slides.media.store', $this->slide), [
        'image' => UploadedFile::fake()->image('first.jpg'),
    ]);

    $this->actingAs($this->admin)->post(route('admin.hero-slides.media.store', $this->slide), [
        'image' => UploadedFile::fake()->image('second.jpg'),
    ]);

    $this->slide->refresh();

    expect($this->slide->getMedia('primary'))->toHaveCount(1)
        ->and($this->slide->getMedia('primary')->first()->file_name)->toBe('second.jpg');
});

it('rejects a non-image upload', function (): void {
    $this->actingAs($this->admin)
        ->post(route('admin.hero-slides.media.store', $this->slide), [
            'image' => UploadedFile::fake()->create('prices.pdf', 100, 'application/pdf'),
        ])
        ->assertSessionHasErrors('image');

    expect($this->slide->refresh()->getMedia('primary'))->toHaveCount(0);
});

it('removes the image', function (): void {
    $this->actingAs($this->admin)->post(route('admin.hero-slides.media.store', $this->slide), [
        'image' => UploadedFile::fake()->image('spread.jpg'),
    ]);

    $this->actingAs($this->admin)
        ->delete(route('admin.hero-slides.media.destroy', $this->slide))
        ->assertRedirect();

    expect($this->slide->refresh()->getMedia('primary'))->toHaveCount(0);
});

it('hands the form the uploaded media', function (): void {
    $this->actingAs($this->admin)->post(route('admin.hero-slides.media.store', $this->slide), [
        'image' => UploadedFile::fake()->image('spread.jpg'),
    ]);

    $this->actingAs($this->admin)
        ->get(route('admin.hero-slides.edit', $this->slide))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('slide.media.url', fn (string $url): bool => str_contains($url, 'spread.jpg'))
        );
});
