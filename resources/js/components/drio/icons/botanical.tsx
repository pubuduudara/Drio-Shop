import { iconAccessibilityProps } from './icon';
import type { IconProps } from './icon';

/**
 * The botanical hairline motif — DRIO's one decorative flourish (§4).
 *
 * A fine gold line terminating in a drawn leaf. It appears as the section
 * header rule, the divider under the logo, the frame around the newsletter
 * band and the mark beside "Why Choose DRIO". Everything else stays
 * disciplined so this carries the identity on its own.
 *
 * All of these are decorative by default and render `aria-hidden`.
 */

/**
 * The section-header rule: a ~32px hairline that terminates in a small leaf.
 */
export function BotanicalRule({
    title,
    length = 32,
    ...props
}: IconProps & { length?: number }) {
    return (
        <svg
            viewBox="0 0 44 12"
            width={length + 12}
            height="12"
            fill="none"
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M0 6h30" stroke="currentColor" strokeWidth="1" />
            <path
                d="M31 6c0-2.6 1.9-4.4 5.2-4.4 0 2.6-1.9 4.4-5.2 4.4Z"
                fill="currentColor"
                opacity="0.9"
            />
            <path
                d="M31 6c1.6-1.4 3.3-2.2 5.2-2.4"
                stroke="var(--drio-cream)"
                strokeWidth="0.6"
            />
            <path
                d="M31 6c0 2.4 1.7 4 4.6 4.2 0-2.4-1.7-4-4.6-4.2Z"
                fill="currentColor"
                opacity="0.55"
            />
        </svg>
    );
}

/**
 * The paired sprig set beside a centred title (§7.5).
 */
export function BotanicalFlourish({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 28 16"
            width="28"
            height="16"
            fill="none"
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M2 8h13" stroke="currentColor" strokeWidth="0.9" />
            <path
                d="M15 8c0-3 2.2-5 6-5 0 3-2.2 5-6 5Z"
                fill="currentColor"
                opacity="0.85"
            />
            <path
                d="M15 8c.6 2.6 2.5 4 5.6 4.2C20.2 9.6 18.3 8.2 15 8Z"
                fill="currentColor"
                opacity="0.5"
            />
            <circle
                cx="24.6"
                cy="8"
                r="1.1"
                fill="currentColor"
                opacity="0.7"
            />
        </svg>
    );
}

/**
 * The hairline divider that sits under the wordmark (§4).
 */
export function BotanicalDivider({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 72 8"
            width="72"
            height="8"
            fill="none"
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path d="M0 4h28M44 4h28" stroke="currentColor" strokeWidth="0.8" />
            <path
                d="M36 1c2.2 1.1 3.3 2.1 3.3 3s-1.1 1.9-3.3 3c-2.2-1.1-3.3-2.1-3.3-3s1.1-1.9 3.3-3Z"
                fill="currentColor"
                opacity="0.85"
            />
        </svg>
    );
}

/**
 * The leaf sprig anchored to the far left of the newsletter band (§7.10).
 * Hidden below `lg` by the section, not by this component.
 */
export function NewsletterSprig({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 140 160"
            width="140"
            height="160"
            fill="none"
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path
                d="M6 152C34 118 58 86 74 56 86 33 92 16 94 4"
                stroke="currentColor"
                strokeWidth="1.4"
                opacity="0.75"
            />
            <g fill="currentColor" opacity="0.5">
                <path d="M74 56c-13-6-24-4-33 6 11 8 22 8 33-6Z" />
                <path d="M74 56c4-13 1-24-9-32-6 12-4 23 9 32Z" />
                <path d="M86 30c-13-4-23-1-31 9 12 7 22 5 31-9Z" />
                <path d="M86 30c6-12 4-23-5-32-7 11-6 22 5 32Z" />
                <path d="M56 92c-14-4-25 0-33 11 13 6 24 3 33-11Z" />
                <path d="M56 92c2-14-2-24-13-31-4 13 0 23 13 31Z" />
                <path d="M34 126c-14-3-24 2-31 13 13 5 24 1 31-13Z" />
            </g>
        </svg>
    );
}

/**
 * The coconut and palm mark anchored to the far right of the newsletter band
 * (§7.10).
 */
export function NewsletterCoconut({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 150 160"
            width="150"
            height="160"
            fill="none"
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <circle
                cx="96"
                cy="104"
                r="40"
                fill="currentColor"
                opacity="0.35"
            />
            <circle
                cx="96"
                cy="104"
                r="27"
                fill="currentColor"
                opacity="0.28"
            />
            <path
                d="M84 60C84 40 96 22 118 12"
                stroke="currentColor"
                strokeWidth="1.4"
                opacity="0.7"
            />
            <g fill="currentColor" opacity="0.45">
                <path d="M118 12c14-6 27-3 38 9-14 7-27 4-38-9Z" />
                <path d="M118 12c-1-15 5-26 19-33 4 14-1 25-19 33Z" />
                <path d="M118 12c-15-3-26 3-32 18 15 3 26-3 32-18Z" />
            </g>
            <path
                d="M64 148c14-10 30-15 48-15s34 5 48 15"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.4"
            />
        </svg>
    );
}

/**
 * The small drawn palm-and-arrow mark above the "Taste the Tradition of Sri
 * Lanka" panel (§7.6).
 */
export function PalmFlourish({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 56 20"
            width="56"
            height="20"
            fill="none"
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path
                d="M4 14h20M32 14h20"
                stroke="currentColor"
                strokeWidth="0.9"
            />
            <path
                d="M28 3c3 3.4 4.4 6.6 4.4 9.6 0 1.6-.4 3-1.2 4.4h-6.4c-.8-1.4-1.2-2.8-1.2-4.4C23.6 9.6 25 6.4 28 3Z"
                fill="currentColor"
                opacity="0.8"
            />
            <path d="M28 17V8" stroke="var(--drio-cream)" strokeWidth="0.7" />
        </svg>
    );
}
