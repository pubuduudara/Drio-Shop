import { iconAccessibilityProps, lineIconProps } from './icon';
import type { IconProps } from './icon';

/**
 * Interface glyphs — header actions, carousel controls, steppers and the star
 * used by `<Rating />`. All 24×24, thin stroke, `currentColor`.
 */

export function SearchIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <circle cx="10.75" cy="10.75" r="6.25" />
            <path d="m15.4 15.4 4.1 4.1" />
        </svg>
    );
}

export function HeartIcon({
    title,
    filled,
    ...props
}: IconProps & { filled?: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            {...lineIconProps}
            fill={filled ? 'currentColor' : 'none'}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M12 20.2s-7.5-4.35-7.5-9.45A4.25 4.25 0 0 1 12 8.1a4.25 4.25 0 0 1 7.5 2.65c0 5.1-7.5 9.45-7.5 9.45Z" />
        </svg>
    );
}

export function BagIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M5.4 8h13.2l-1 11.2a1.4 1.4 0 0 1-1.4 1.3H7.8a1.4 1.4 0 0 1-1.4-1.3Z" />
            <path d="M9 10.2V7.3a3 3 0 0 1 6 0v2.9" />
        </svg>
    );
}

export function MenuIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

export function CloseIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M6 6 18 18M18 6 6 18" />
        </svg>
    );
}

/** The trailing arrow that nudges 3px right on button and link hover (§5.4). */
export function ArrowRightIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M4.5 12h15M13.5 6l6 6-6 6" />
        </svg>
    );
}

export function ChevronLeftIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="m14.5 5.5-7 6.5 7 6.5" />
        </svg>
    );
}

export function ChevronRightIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="m9.5 5.5 7 6.5-7 6.5" />
        </svg>
    );
}

export function PlusIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M12 5.5v13M5.5 12h13" />
        </svg>
    );
}

export function MinusIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M5.5 12h13" />
        </svg>
    );
}

export function CheckIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
    );
}

/**
 * A single star, drawn as a solid shape clipped horizontally so `<Rating />`
 * can render halves without a second glyph.
 *
 * @param fill Portion of the star to paint, 0–1.
 */
export function StarIcon({
    title,
    fill = 1,
    id,
    ...props
}: Omit<IconProps, 'fill'> & { fill?: number }) {
    const clipId = `drio-star-${id ?? Math.round(fill * 100)}`;
    const points =
        '12 2.6 14.85 8.55 21.4 9.45 16.65 14 17.8 20.5 12 17.4 6.2 20.5 7.35 14 2.6 9.45 9.15 8.55';

    return (
        <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <defs>
                <clipPath id={clipId}>
                    <rect
                        x="0"
                        y="0"
                        width={24 * Math.min(Math.max(fill, 0), 1)}
                        height="24"
                    />
                </clipPath>
            </defs>
            <polygon
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinejoin="round"
                opacity="0.35"
            />
            <polygon
                points={points}
                fill="currentColor"
                clipPath={`url(#${clipId})`}
            />
        </svg>
    );
}

/** The glyph revealed on Instagram tile hover (§7.9). */
export function InstagramGlyphIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.75" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
        </svg>
    );
}
