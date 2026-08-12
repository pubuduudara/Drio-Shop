import { cn } from '@/lib/utils';
import { PLACEHOLDER_RATIOS, Placeholder } from './placeholder';
import type { PlaceholderRatio } from './placeholder';

/**
 * The shape a Media Library conversion set arrives in from the API resources.
 * `srcset` is a plain string so the resource decides the widths, not the
 * component.
 */
export type MediaRecord = {
    url: string;
    srcset?: string;
    sizes?: string;
    alt: string;
    width?: number;
    height?: number;
};

export type MediaProps = {
    /** Absent until the client supplies real assets — then this fills in. */
    media?: MediaRecord | null;
    ratio: PlaceholderRatio;
    /** Shown by the placeholder, naming what belongs in this slot. */
    label: string;
    className?: string;
    imageClassName?: string;
    rounded?: 'none' | 'card' | 'panel';
    /** Hero and other above-the-fold slots load eagerly (§11). */
    priority?: boolean;
    /** Forwarded to the placeholder for slots that carry overlaid content. */
    captionPlacement?: 'center' | 'top';
};

/**
 * Renders a real image when a media record exists and the placeholder when it
 * does not (§3).
 *
 * Every photograph in the storefront goes through here, so switching the site
 * from placeholders to real photography is a data operation — uploading media
 * in the admin — rather than a code change.
 */
export function Media({
    media,
    ratio,
    label,
    className,
    imageClassName,
    rounded = 'none',
    priority = false,
    captionPlacement = 'center',
}: MediaProps) {
    if (!media) {
        return (
            <Placeholder
                ratio={ratio}
                label={label}
                className={className}
                rounded={rounded}
                captionPlacement={captionPlacement}
            />
        );
    }

    const roundedClass =
        rounded === 'card'
            ? 'rounded-card'
            : rounded === 'panel'
              ? 'rounded-panel'
              : '';

    return (
        <div
            className={cn(
                'relative w-full overflow-hidden bg-sand',
                roundedClass,
                className,
            )}
            style={{ aspectRatio: String(PLACEHOLDER_RATIOS[ratio]) }}
        >
            <img
                src={media.url}
                srcSet={media.srcset}
                sizes={media.sizes}
                alt={media.alt}
                width={media.width}
                height={media.height}
                loading={priority ? 'eager' : 'lazy'}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : 'auto'}
                className={cn('h-full w-full object-cover', imageClassName)}
            />
        </div>
    );
}
