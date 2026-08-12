import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/drio/icons/ui';
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/types/admin';

/**
 * Storefront pagination (§7.12).
 *
 * Deliberately separate from the admin's: the console is a work tool and this
 * is the brand surface, and the two applications share no visual language
 * (§12). Both read the same `PaginatedPayload` shape from the server.
 */
export function StorefrontPagination({
    meta,
    links,
    className,
}: {
    meta: PaginationMeta;
    links: { prev: string | null; next: string | null };
    className?: string;
}) {
    const { t } = useTranslation(['shop', 'common']);

    if (meta.lastPage <= 1) {
        return null;
    }

    return (
        <nav
            aria-label={t('shop:pagination.label')}
            className={cn(
                'flex flex-wrap items-center justify-between gap-4',
                className,
            )}
        >
            <p className="text-small text-ink-muted">
                {t('shop:pagination.page', {
                    current: meta.currentPage,
                    last: meta.lastPage,
                })}
            </p>

            <div className="flex items-center gap-2">
                <PageLink
                    href={links.prev}
                    label={t('common:actions.previous')}
                    icon={<ChevronLeftIcon width={14} height={14} />}
                />
                <PageLink
                    href={links.next}
                    label={t('common:actions.next')}
                    icon={<ChevronRightIcon width={14} height={14} />}
                    trailing
                />
            </div>
        </nav>
    );
}

function PageLink({
    href,
    label,
    icon,
    trailing = false,
}: {
    href: string | null;
    label: string;
    icon: React.ReactNode;
    trailing?: boolean;
}) {
    const className = cn(
        'inline-flex items-center gap-2 rounded-btn border px-4 py-2 text-small transition-colors',
        href
            ? 'border-hairline bg-surface text-ink hover:border-ink'
            : 'border-hairline/60 bg-transparent text-ink-muted/50',
    );

    const content = (
        <>
            {!trailing && icon}
            {label}
            {trailing && icon}
        </>
    );

    if (!href) {
        return (
            <span className={className} aria-disabled>
                {content}
            </span>
        );
    }

    return (
        <Link href={href} className={className}>
            {content}
        </Link>
    );
}
