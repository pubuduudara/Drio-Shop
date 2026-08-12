import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A circular icon-only control (§5.4) — header actions, carousel arrows, the
 * product card's wishlist heart.
 *
 * `label` is required rather than optional: an icon-only button with no
 * accessible name is the single most common a11y defect in a storefront, and
 * the type system is a cheaper place to catch it than an audit (§11).
 */
const iconButtonVariants = cva(
    [
        'inline-flex items-center justify-center rounded-full',
        'border transition-colors duration-200',
        'disabled:pointer-events-none disabled:opacity-40',
    ],
    {
        variants: {
            variant: {
                /** Transparent over cream — the header at scroll-top. */
                plain: 'border-transparent bg-transparent text-ink hover:text-gold-700',
                /** Over the hero and on forest surfaces. */
                light: 'border-transparent bg-transparent text-cream hover:text-gold-200',
                /** White circle with a hairline — the wishlist heart on cards. */
                surface:
                    'border-line bg-paper text-ink-muted shadow-[0_1px_2px_rgba(38,34,29,0.06)] hover:text-chilli',
                /** Outlined circle — the review carousel arrows (§7.8). */
                outline:
                    'border-line bg-paper text-ink hover:border-gold hover:text-gold-700',
            },
            size: {
                sm: 'h-8 w-8',
                md: 'h-10 w-10',
                lg: 'h-11 w-11',
            },
        },
        defaultVariants: {
            variant: 'plain',
            size: 'md',
        },
    },
);

export type IconButtonProps = VariantProps<typeof iconButtonVariants> &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
        /** Accessible name for the control. Not optional by design. */
        label: string;
        children: ReactNode;
        /** Renders a badge or other overlay positioned against the button. */
        badge?: ReactNode;
        className?: string;
    };

export function IconButton({
    variant,
    size,
    label,
    children,
    badge,
    className,
    type = 'button',
    ...props
}: IconButtonProps) {
    const button = (
        <button
            type={type}
            aria-label={label}
            title={label}
            className={cn(iconButtonVariants({ variant, size }), className)}
            {...props}
        >
            {children}
        </button>
    );

    if (!badge) {
        /*
         * No wrapper unless a badge needs anchoring. A `relative` span around
         * every icon button would capture the `absolute` a caller puts in
         * `className` — the product card's wishlist heart positioned itself
         * against a zero-width wrapper instead of against the media, which put
         * it outside the card entirely.
         */
        return button;
    }

    return (
        <span className="relative inline-flex">
            {button}
            {badge}
        </span>
    );
}

export { iconButtonVariants };
