import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BotanicalRule } from '@/components/drio/icons/botanical';
import { ChevronRightIcon } from '@/components/drio/icons/ui';

/**
 * The banner every storefront page other than the homepage opens with.
 *
 * The site header is fixed and overlays the hero by design (§7.1), so pages
 * that do not open with a hero have to reserve that space themselves — the top
 * padding here is what keeps the title clear of the bar.
 */

export type Crumb = {
    label: string;
    href?: string;
};

export function StorefrontPageHeader({
    eyebrow,
    title,
    description,
    crumbs = [],
    children,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    crumbs?: Crumb[];
    /** Filters, counts or anything else that belongs on the banner's baseline. */
    children?: ReactNode;
}) {
    return (
        <header className="border-b border-hairline bg-band">
            <div className="mx-auto max-w-drio px-5 pt-28 pb-10 md:px-8 md:pt-32 md:pb-12 lg:px-10">
                {crumbs.length > 0 && <Breadcrumbs crumbs={crumbs} />}

                {eyebrow && (
                    <p className="mt-4 drio-eyebrow text-gold-700">{eyebrow}</p>
                )}

                <div className="mt-2 flex items-center gap-3">
                    <h1 className="font-display text-section font-medium text-ink">
                        {title}
                    </h1>
                    <BotanicalRule
                        className="mt-1 shrink-0 text-gold"
                        aria-hidden
                    />
                </div>

                {description && (
                    <p className="mt-3 max-w-2xl text-copy text-ink-muted">
                        {description}
                    </p>
                )}

                {children}
            </div>
        </header>
    );
}

function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
    const { t } = useTranslation('common');

    return (
        <nav aria-label={t('aria.breadcrumb')}>
            <ol className="flex flex-wrap items-center gap-1.5 text-small text-ink-muted">
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;

                    return (
                        <li
                            key={crumb.label}
                            className="flex items-center gap-1.5"
                        >
                            {crumb.href && !isLast ? (
                                <Link
                                    href={crumb.href}
                                    className="transition-colors hover:text-gold-700"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span
                                    aria-current={isLast ? 'page' : undefined}
                                    className={isLast ? 'text-ink' : undefined}
                                >
                                    {crumb.label}
                                </span>
                            )}

                            {!isLast && (
                                <ChevronRightIcon
                                    width={12}
                                    height={12}
                                    className="text-ink-muted/60"
                                    aria-hidden
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
