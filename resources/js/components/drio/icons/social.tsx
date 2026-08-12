import { iconAccessibilityProps, lineIconProps } from './icon';
import type { IconProps } from './icon';

/** Footer social marks (§7.11), drawn to sit in a circular forest-700 badge. */

export function InstagramIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            {...lineIconProps}
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <rect x="4" y="4" width="16" height="16" rx="4.5" />
            <circle cx="12" cy="12" r="3.7" />
            <circle
                cx="16.9"
                cy="7.1"
                r="1"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
}

export function FacebookIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path
                fill="currentColor"
                d="M13.6 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.8V3.6A21 21 0 0 0 14.4 3.5c-2.4 0-4 1.45-4 4.1v2.3H7.7V13h2.7v8Z"
            />
        </svg>
    );
}

export function YouTubeIcon({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path
                fill="currentColor"
                d="M21.1 8.2a2.4 2.4 0 0 0-1.7-1.7C17.9 6.1 12 6.1 12 6.1s-5.9 0-7.4.4A2.4 2.4 0 0 0 2.9 8.2 25 25 0 0 0 2.5 12a25 25 0 0 0 .4 3.8 2.4 2.4 0 0 0 1.7 1.7c1.5.4 7.4.4 7.4.4s5.9 0 7.4-.4a2.4 2.4 0 0 0 1.7-1.7 25 25 0 0 0 .4-3.8 25 25 0 0 0-.4-3.8ZM10.2 14.6V9.4l4.6 2.6Z"
            />
        </svg>
    );
}
