<?php

declare(strict_types=1);

namespace App\Support;

use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Shapes a Media Library record into what the `<Media />` component expects,
 * or null when nothing has been uploaded yet.
 *
 * Returning null is the normal case right now: the client supplies real assets
 * later, and until then `<Media />` renders the placeholder (§3). Because the
 * shape is decided here rather than in the component, swapping placeholders for
 * photography is an upload, not a deploy.
 *
 * @phpstan-type MediaPayload array{url: string, srcset: string|null, alt: string, width: int|null, height: int|null}
 */
final class MediaPresenter
{
    /**
     * @return MediaPayload|null
     */
    public static function first(HasMedia $model, string $collection, string $alt): ?array
    {
        // `getMedia()` is on the HasMedia contract; `getFirstMedia()` is only
        // on the InteractsWithMedia trait, so taking the first item here keeps
        // this working for anything that satisfies the interface.
        $media = $model->getMedia($collection)->first();

        return $media instanceof Media ? self::forMedia($media, $alt) : null;
    }

    /**
     * Shapes an already-resolved Media row, for callers that need to validate
     * it — e.g. Product::primaryImage() — before it reaches here.
     *
     * @return MediaPayload
     */
    public static function forMedia(Media $media, string $alt): array
    {
        $srcset = $media->getSrcset();

        return [
            'url' => $media->getUrl(),
            'srcset' => $srcset === '' ? null : $srcset,
            // The alt text describes the record, not the file, so it is
            // translated content rather than an upload attribute.
            'alt' => $alt,
            'width' => self::dimension($media->getCustomProperty('width')),
            'height' => self::dimension($media->getCustomProperty('height')),
        ];
    }

    private static function dimension(mixed $value): ?int
    {
        return is_numeric($value) ? (int) $value : null;
    }
}
