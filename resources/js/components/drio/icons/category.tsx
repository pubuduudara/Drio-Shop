import { iconAccessibilityProps, lineIconProps } from './icon';
import type { IconProps } from './icon';

/**
 * Category glyphs, keyed by the `icon_key` column on `categories` (§6). The
 * map is the contract between the database and the drawn set — the admin icon
 * picker (§8) offers exactly these keys.
 */
export const CATEGORY_ICON_KEYS = [
    'leaf',
    'powder',
    'chilli',
    'spice',
] as const;

export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];

function LeafIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M19.5 4.5c0 8.2-4.3 12.4-9.6 12.4A5.4 5.4 0 0 1 4.5 11.5C4.5 6.6 10.2 4.5 19.5 4.5Z" />
            <path d="M17 7c-4.9 1.6-8.4 5.4-11 12.5" />
        </svg>
    );
}

function PowderIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M3.6 14.2h16.8a8.4 8.4 0 0 1-16.8 0Z" />
            <path d="M8.2 14.2c1-2.5 2.3-3.8 3.8-3.8s2.8 1.3 3.8 3.8" />
            <path d="M12 4.2v2.6M9 5.6l.9 1.6M15 5.6l-.9 1.6" />
        </svg>
    );
}

function ChilliIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M14.8 7.4c2.2 1.5 3 4.4 1.9 7.2-1.3 3.2-4.6 5.1-8 4.7-2.2-.3-3.7-1.5-4.2-3.2 3 .5 5.6-.4 7.4-2.3 1.5-1.6 2.3-3.8 2.9-6.4Z" />
            <path d="M14.8 7.4c-.5-1.3-.2-2.3.9-2.9M15.7 4.5c1.3-.3 2.3.2 2.8 1.4" />
        </svg>
    );
}

function SpiceIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M6.3 4.6c2.6 3.4 3.4 8.2 2.2 14.8M9.6 4.6c2.6 3.4 3.4 8.2 2.2 14.8" />
            <path d="M14.4 19.4c2-3.2 4.4-5.1 7.1-5.6-.4 3-2.5 5.3-6 6.2" />
            <path d="M2.6 12.8c2.5.3 4.4 1.3 5.6 3" />
        </svg>
    );
}

const CATEGORY_ICONS: Record<
    CategoryIconKey,
    (props: IconProps) => React.JSX.Element
> = {
    leaf: LeafIcon,
    powder: PowderIcon,
    chilli: ChilliIcon,
    spice: SpiceIcon,
};

export { LeafIcon, PowderIcon, ChilliIcon, SpiceIcon };

/**
 * Resolves an `icon_key` to its glyph, falling back to the leaf so an
 * unrecognised key from the database degrades to a mark rather than a gap.
 */
export function CategoryIcon({
    iconKey,
    ...props
}: IconProps & { iconKey: CategoryIconKey | string }) {
    const Glyph =
        CATEGORY_ICONS[iconKey as CategoryIconKey] ?? CATEGORY_ICONS.leaf;

    return <Glyph {...props} />;
}
