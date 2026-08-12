import { cn } from '@/lib/utils';
import { LeafMark } from './wordmark';

/**
 * Aspect ratios the design uses. Keeping this a closed set means a slot can
 * never be given a ratio the layout was not designed around.
 */
export const PLACEHOLDER_RATIOS = {
    '21/9': 21 / 9,
    '16/9': 16 / 9,
    '4/3': 4 / 3,
    '1/1': 1,
    '3/4': 3 / 4,
} as const;

export type PlaceholderRatio = keyof typeof PLACEHOLDER_RATIOS;

export type PlaceholderProps = {
    ratio: PlaceholderRatio;
    /** Names what belongs here, e.g. `Hero — spread of products on wood`. */
    label: string;
    className?: string;
    rounded?: 'none' | 'card' | 'panel';
    /**
     * Where the caption sits. Slots that carry overlaid content — a scrimmed
     * recipe title, the Our Story panel — push it to the top so the caption
     * and the real copy do not sit on top of each other while the photograph
     * is still missing.
     */
    captionPlacement?: 'center' | 'top';
};

const roundedClasses = {
    none: '',
    card: 'rounded-card',
    panel: 'rounded-panel',
} as const;

/**
 * The stand-in for every photograph until the client supplies real assets (§3).
 *
 * It holds the slot's exact aspect ratio, so swapping in a real image causes
 * zero layout shift — that is the whole point of it, more than the styling.
 */
export function Placeholder({
    ratio,
    label,
    className,
    rounded = 'none',
    captionPlacement = 'center',
}: PlaceholderProps) {
    return (
        <div
            className={cn(
                // A container, so the caption responds to the size of this
                // slot rather than the viewport: the same component fills a
                // full-bleed hero and a 56px cart thumbnail, and a caption
                // clipped mid-word in the small one reads as a broken image.
                '@container relative flex w-full justify-center overflow-hidden bg-sand drio-hatch',
                captionPlacement === 'top'
                    ? 'items-start pt-4'
                    : 'items-center',
                roundedClasses[rounded],
                className,
            )}
            style={{ aspectRatio: String(PLACEHOLDER_RATIOS[ratio]) }}
            data-placeholder={ratio}
        >
            <div className="flex flex-col items-center gap-2 px-4 text-center">
                <LeafMark
                    className="h-4 w-5 text-gold/55 @[8rem]:h-6 @[8rem]:w-7"
                    aria-hidden
                />
                {label !== '' && (
                    <span className="hidden max-w-[22ch] drio-eyebrow leading-relaxed text-ink-muted @[10rem]:inline">
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
}
