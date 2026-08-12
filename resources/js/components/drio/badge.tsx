import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Small status marks — sale flags, dietary notes, stock states (§5.4).
 *
 * `chilli` is the sparing accent the palette reserves for sale badges and
 * errors; reach for `sand` or `outline` first.
 */
const badgeVariants = cva(
    'inline-flex items-center gap-1 rounded-btn px-2 py-1 drio-eyebrow',
    {
        variants: {
            variant: {
                sale: 'bg-chilli text-white',
                gold: 'bg-gold text-white',
                sand: 'bg-sand text-ink-muted',
                outline: 'border border-line bg-transparent text-ink-muted',
                forest: 'bg-forest-700 text-cream',
                clay: 'bg-clay/12 text-clay-700',
            },
        },
        defaultVariants: {
            variant: 'sand',
        },
    },
);

export type BadgeProps = VariantProps<typeof badgeVariants> & {
    children: ReactNode;
    className?: string;
};

export function Badge({ variant, children, className }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)}>
            {children}
        </span>
    );
}

/**
 * The count bubble on the header's wishlist and cart actions (§7.1).
 *
 * Announced politely rather than assertively — a cart count changing should
 * reach a screen reader without interrupting what it is currently reading.
 */
export function CountBadge({
    count,
    label,
    className,
}: {
    count: number;
    /** Accessible description, e.g. `3 items in cart`. */
    label: string;
    className?: string;
}) {
    if (count <= 0) {
        return null;
    }

    return (
        <span
            className={cn(
                'bg-gold text-[0.625rem] font-semibold text-white',
                'absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1',
                className,
            )}
            aria-live="polite"
            aria-label={label}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
}
