import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { Rating } from '@/components/drio/rating';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { destroy, index, moderate } from '@/routes/admin/reviews';
import type { Paginated, ReviewRow } from '@/types/admin';

/**
 * The moderation queue (§8): approve, unapprove, feature on the homepage,
 * delete.
 *
 * Cards rather than a table — a moderator has to read the body to decide, and
 * a review truncated into a table cell cannot be judged. Unpublished reviews
 * lead the default view, because the queue exists to be emptied.
 */

const FILTERS = ['', 'pending', 'published', 'featured'] as const;

export default function ReviewsIndex({
    reviews,
    filters,
    pendingCount,
}: {
    reviews: Paginated<ReviewRow>;
    filters: { status: string };
    pendingCount: number;
}) {
    const { t } = useTranslation('admin');
    const [pendingDelete, setPendingDelete] = useState<ReviewRow | null>(null);

    return (
        <>
            <Head title={t('reviews.title')} />

            <PageHeader
                title={t('reviews.title')}
                description={
                    pendingCount > 0
                        ? t('reviews.pending', { count: pendingCount })
                        : t('reviews.allClear')
                }
            />

            <nav
                aria-label={t('reviews.filterLabel')}
                className="mb-3 flex flex-wrap gap-1.5"
            >
                {FILTERS.map((status) => (
                    <Link
                        key={status || 'all'}
                        href={index({
                            query: { status: status || undefined },
                        })}
                        preserveScroll
                        aria-current={
                            filters.status === status ? 'page' : undefined
                        }
                        className={cn(
                            'rounded border px-2.5 py-1 text-[12px] transition-colors',
                            filters.status === status
                                ? 'border-neutral-900 bg-neutral-900 text-white'
                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50',
                        )}
                    >
                        {t(`reviews.filters.${status || 'all'}`)}
                    </Link>
                ))}
            </nav>

            {reviews.data.length === 0 ? (
                <p className="rounded-md border border-neutral-200 px-4 py-10 text-center text-neutral-500">
                    {t('reviews.empty')}
                </p>
            ) : (
                <ul className="grid gap-2">
                    {reviews.data.map((review) => (
                        <li
                            key={review.id}
                            className={cn(
                                'rounded-md border p-4',
                                review.isPublished
                                    ? 'border-neutral-200'
                                    : 'border-amber-300 bg-amber-50/40',
                            )}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <Rating value={review.rating} />
                                    <p className="mt-1 font-medium">
                                        {review.customerName}
                                        {review.customerCity && (
                                            <span className="text-neutral-500">
                                                {', '}
                                                {review.customerCity}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-[11px] text-neutral-500">
                                        {review.productName
                                            ? review.productName
                                            : t('reviews.brandReview')}
                                        {review.submittedAt &&
                                            ` · ${review.submittedAt}`}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    {review.isFeatured && (
                                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                                            {t('reviews.featured')}
                                        </span>
                                    )}

                                    {review.isPublished ? (
                                        <Action
                                            review={review}
                                            action="unpublish"
                                            label={t(
                                                'reviews.actions.unpublish',
                                            )}
                                        />
                                    ) : (
                                        <Action
                                            review={review}
                                            action="publish"
                                            label={t('reviews.actions.publish')}
                                        />
                                    )}

                                    {review.isFeatured ? (
                                        <Action
                                            review={review}
                                            action="unfeature"
                                            label={t(
                                                'reviews.actions.unfeature',
                                            )}
                                        />
                                    ) : (
                                        <Action
                                            review={review}
                                            action="feature"
                                            label={t('reviews.actions.feature')}
                                        />
                                    )}

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-700 hover:bg-red-50"
                                        onClick={() => setPendingDelete(review)}
                                    >
                                        {t('actions.delete')}
                                    </Button>
                                </div>
                            </div>

                            <p className="mt-3 text-neutral-700">
                                {review.body}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            <Pagination meta={reviews.meta} links={reviews.links} />

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                name={pendingDelete?.customerName ?? ''}
                onConfirm={() => {
                    if (pendingDelete) {
                        router.delete(destroy(pendingDelete.id).url, {
                            preserveScroll: true,
                        });
                    }

                    setPendingDelete(null);
                }}
            />
        </>
    );
}

function Action({
    review,
    action,
    label,
}: {
    review: ReviewRow;
    action: 'publish' | 'unpublish' | 'feature' | 'unfeature';
    label: string;
}) {
    return (
        <Button
            size="sm"
            variant="outline"
            onClick={() =>
                router.patch(
                    moderate(review.id).url,
                    { action },
                    { preserveScroll: true },
                )
            }
        >
            {label}
        </Button>
    );
}
