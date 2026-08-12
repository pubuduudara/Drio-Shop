import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/types/admin';

/**
 * Previous/next pagination for admin lists.
 *
 * Deliberately not a numbered page strip: the console's lists are filtered and
 * searched rather than browsed, so a range read-out plus two steps is what an
 * operator actually uses.
 */
export function Pagination({
    meta,
    links,
}: {
    meta: PaginationMeta;
    links: { prev: string | null; next: string | null };
}) {
    const { t } = useTranslation('admin');

    if (meta.lastPage <= 1) {
        return null;
    }

    return (
        <nav
            aria-label={t('pagination.label')}
            className="mt-3 flex items-center justify-between gap-3"
        >
            <p className="text-neutral-500">
                {t('pagination.range', {
                    from: meta.from ?? 0,
                    to: meta.to ?? 0,
                    total: meta.total,
                })}
            </p>

            <div className="flex items-center gap-1.5">
                <PageLink href={links.prev} label={t('pagination.previous')} />
                <PageLink href={links.next} label={t('pagination.next')} />
            </div>
        </nav>
    );
}

function PageLink({ href, label }: { href: string | null; label: string }) {
    const className = cn(
        'rounded border px-2.5 py-1 text-[13px] transition-colors',
        href
            ? 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            : 'border-neutral-100 text-neutral-300',
    );

    if (!href) {
        return (
            <span className={className} aria-disabled>
                {label}
            </span>
        );
    }

    return (
        <Link href={href} preserveScroll className={className}>
            {label}
        </Link>
    );
}
