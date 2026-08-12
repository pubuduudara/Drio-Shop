import type { SVGProps } from 'react';

/**
 * Every DRIO glyph is drawn inline rather than placeheld (§3), so the icon set
 * inherits `currentColor` and scales with type.
 *
 * Icons are decorative by default: they render `aria-hidden` unless given a
 * `title`, which turns them into a labelled `img` for the cases where the glyph
 * is the only content (an icon-only button, a payment mark).
 */
export type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
    /** Accessible name. Omit for decorative glyphs sitting beside real text. */
    title?: string;
};

/**
 * Splits `title` into the accessibility attributes an inline SVG needs.
 */
export function iconAccessibilityProps(title?: string): {
    role?: 'img';
    'aria-hidden'?: true;
    'aria-label'?: string;
} {
    return title
        ? { role: 'img', 'aria-label': title }
        : { 'aria-hidden': true };
}

/** Shared geometry for the thin-stroke line-art icons (§7.5). */
export const lineIconProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.25,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
} as const;
