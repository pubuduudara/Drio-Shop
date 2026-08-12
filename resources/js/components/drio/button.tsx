import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRightIcon } from './icons/ui';

/**
 * The storefront button (§5.4).
 *
 * Deliberately separate from `components/ui/button.tsx`, which is shadcn's and
 * belongs to the admin console — the two applications do not share a visual
 * language (§12).
 */
const buttonVariants = cva(
    [
        'group/button inline-flex items-center justify-center gap-2',
        'font-body font-medium tracking-wide whitespace-nowrap',
        'rounded-btn border transition-colors duration-200',
        'disabled:pointer-events-none disabled:opacity-45',
    ],
    {
        variants: {
            variant: {
                /** Solid gold, white text — the one call to action per view. */
                primary:
                    'border-transparent bg-gold text-white hover:bg-gold-600 active:bg-gold-600',
                /** 1px border on transparent, filling on hover. */
                outline:
                    'border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-cream',
                /** Text-only, for tertiary actions and in-card links. */
                ghost: 'border-transparent bg-transparent text-ink hover:text-gold-700',
                /** For placing on forest surfaces — the hero's secondary CTA. */
                dark: 'border-cream/45 bg-transparent text-cream hover:border-cream hover:bg-cream hover:text-ink',
            },
            size: {
                sm: 'h-9 px-4 text-small',
                md: 'h-11 px-6 text-small',
                lg: 'h-12 px-8 text-copy',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

type SharedButtonProps = ButtonVariants & {
    children: ReactNode;
    /** Appends the arrow that nudges 3px right on hover (§5.4). */
    withArrow?: boolean;
    className?: string;
};

export type ButtonProps = SharedButtonProps &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

// `size` and `variant` are omitted from the anchor attributes so the button's
// own variants win the intersection rather than collapsing to `never`.
export type ButtonLinkProps = SharedButtonProps &
    Omit<InertiaLinkProps, 'children' | 'className' | 'size' | 'variant'>;

function ButtonContent({
    children,
    withArrow,
}: Pick<SharedButtonProps, 'children' | 'withArrow'>) {
    return (
        <>
            {children}
            {withArrow && (
                <ArrowRightIcon className="transition-transform duration-200 group-hover/button:translate-x-[3px]" />
            )}
        </>
    );
}

export function Button({
    variant,
    size,
    withArrow,
    className,
    children,
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        >
            <ButtonContent withArrow={withArrow}>{children}</ButtonContent>
        </button>
    );
}

/**
 * The same surface rendered as an Inertia link, for actions that navigate.
 * A real `<a>` rather than a button with an onClick (§11).
 */
export function ButtonLink({
    variant,
    size,
    withArrow,
    className,
    children,
    ...props
}: ButtonLinkProps) {
    return (
        <Link
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        >
            <ButtonContent withArrow={withArrow}>{children}</ButtonContent>
        </Link>
    );
}

export { buttonVariants };
