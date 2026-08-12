import { iconAccessibilityProps, lineIconProps } from './icon';
import type { IconProps } from './icon';

/**
 * The five "Why Choose DRIO" glyphs (§7.5), drawn as thin-stroke line art to
 * sit inside a circular `line` outline.
 */
export const FEATURE_ICON_KEYS = [
    'imported',
    'natural',
    'homemade',
    'delivery',
    'quality',
] as const;

export type FeatureIconKey = (typeof FEATURE_ICON_KEYS)[number];

/** Imported from Sri Lanka — a stupa silhouette. */
function ImportedIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M4.5 20.5h15" />
            <path d="M6.2 20.5v-2.2h11.6v2.2" />
            <path d="M7.4 18.3c0-3.6 2.1-6.2 4.6-6.2s4.6 2.6 4.6 6.2" />
            <path d="M12 12.1V8.4M10.4 8.4h3.2M12 8.4V5.2l1.6-1.7" />
        </svg>
    );
}

/** 100% natural ingredients — a sprig. */
function NaturalIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M12 20.5V9.8" />
            <path d="M12 13.4c-3.4 0-5.4-1.9-5.4-5.2 3.4 0 5.4 1.8 5.4 5.2Z" />
            <path d="M12 11.2c0-3.6 2.1-5.6 5.7-5.6 0 3.6-2.1 5.6-5.7 5.6Z" />
        </svg>
    );
}

/** Homemade recipes — a heart with a spoon. */
function HomemadeIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M11.6 19.4S4.8 15.5 4.8 10.8a3.9 3.9 0 0 1 6.8-2.4 3.9 3.9 0 0 1 6.8 2.4c0 4.7-6.8 8.6-6.8 8.6Z" />
            <path d="M17.6 14.6c1.6 1.2 2.4 2.4 2.4 3.6a2 2 0 0 1-4 0c0-1.2.8-2.4 1.6-3.6Z" />
        </svg>
    );
}

/** Fast delivery across Japan — a van. */
function DeliveryIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M2.8 7.4h10.4v9.2H2.8z" />
            <path d="M13.2 10.4h3.6l3.4 3.1v3.1h-7z" />
            <circle cx="7" cy="18.1" r="1.6" />
            <circle cx="16.6" cy="18.1" r="1.6" />
        </svg>
    );
}

/** Premium export quality — a rosette. */
function QualityIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M12 3.4l2.3 1.5 2.7-.3 1 2.6 2.3 1.5-.9 2.6.9 2.6-2.3 1.5-1 2.6-2.7-.3L12 19.4l-2.3-1.7-2.7.3-1-2.6-2.3-1.5.9-2.6-.9-2.6L6 7.2l1-2.6 2.7.3Z" />
            <path d="m9.6 11.6 1.8 1.8 3.4-3.6" />
        </svg>
    );
}

const FEATURE_ICONS: Record<
    FeatureIconKey,
    (props: IconProps) => React.JSX.Element
> = {
    imported: ImportedIcon,
    natural: NaturalIcon,
    homemade: HomemadeIcon,
    delivery: DeliveryIcon,
    quality: QualityIcon,
};

export { ImportedIcon, NaturalIcon, HomemadeIcon, DeliveryIcon, QualityIcon };

export function FeatureIcon({
    iconKey,
    ...props
}: IconProps & { iconKey: FeatureIconKey }) {
    const Glyph = FEATURE_ICONS[iconKey] ?? FEATURE_ICONS.natural;

    return <Glyph {...props} />;
}
