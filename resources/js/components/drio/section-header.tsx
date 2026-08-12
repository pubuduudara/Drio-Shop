import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { BotanicalRule } from './icons/botanical';
import { ArrowRightIcon } from './icons/ui';

export type SectionHeaderProps = {
    title: string;
    /** Renders the right-aligned link when both this and the label are given. */
    viewAllHref?: NonNullable<InertiaLinkProps['href']>;
    viewAllLabel?: string;
    /** A second line under the title, e.g. the Instagram handle (§7.9). */
    subtitle?: string;
    /** `h2` by default; the homepage's single `h1` lives in the hero (§11). */
    as?: 'h1' | 'h2' | 'h3';
    className?: string;
    id?: string;
};

/**
 * The repeating section header (§4): left-aligned serif title, the short gold
 * botanical rule beside it, and a right-aligned `View all X →` link on the same
 * baseline.
 *
 * Used by Featured Categories, Best Sellers, Recipe Inspiration, Customer
 * Reviews and Follow Our Journey — built once so the rhythm cannot drift
 * between them.
 */
export function SectionHeader({
    title,
    viewAllHref,
    viewAllLabel,
    subtitle,
    as: Heading = 'h2',
    className,
    id,
}: SectionHeaderProps) {
    const showViewAll = Boolean(viewAllHref && viewAllLabel);

    return (
        <div
            className={cn(
                'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2',
                className,
            )}
        >
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <Heading
                        id={id}
                        className="font-display text-section font-medium text-ink"
                    >
                        {title}
                    </Heading>
                    <BotanicalRule
                        className="mt-1 shrink-0 text-gold"
                        aria-hidden
                    />
                </div>

                {subtitle && (
                    <span className="mt-1.5 drio-eyebrow text-ink-muted">
                        {subtitle}
                    </span>
                )}
            </div>

            {showViewAll && viewAllHref && (
                <Link
                    href={viewAllHref}
                    className="group/viewall inline-flex items-center gap-2 text-small text-ink-muted transition-colors hover:text-gold-700"
                >
                    <span className="relative">
                        {viewAllLabel}
                        {/* The gold underline sweep on text links (§4). */}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-[width] duration-300 group-hover/viewall:w-full" />
                    </span>
                    <ArrowRightIcon className="transition-transform duration-200 group-hover/viewall:translate-x-[3px]" />
                </Link>
            )}
        </div>
    );
}
