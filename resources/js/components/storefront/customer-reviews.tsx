import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/drio/icon-button';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/drio/icons/ui';
import { Placeholder } from '@/components/drio/placeholder';
import { Rating } from '@/components/drio/rating';
import { SectionHeader } from '@/components/drio/section-header';
import type { CustomerReview } from '@/types/storefront';

/**
 * Customer Reviews (§7.8).
 *
 * A scroll-snap carousel showing four cards at a time, with circular outline
 * arrows at the row's edges. Native scroll rather than a transform, so swipe
 * and keyboard scrolling work for free and the arrows only need to nudge it.
 */
export function CustomerReviews({ reviews }: { reviews: CustomerReview[] }) {
    const { t } = useTranslation('home');
    const trackRef = useRef<HTMLUListElement>(null);

    const [canScrollBack, setCanScrollBack] = useState(false);
    const [canScrollForward, setCanScrollForward] = useState(false);

    const syncArrows = useCallback(() => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        // A pixel of slack: sub-pixel scroll widths otherwise leave the
        // forward arrow enabled at the very end.
        const maxScroll = track.scrollWidth - track.clientWidth - 1;

        setCanScrollBack(track.scrollLeft > 1);
        setCanScrollForward(track.scrollLeft < maxScroll);
    }, []);

    useEffect(() => {
        syncArrows();

        const track = trackRef.current;
        track?.addEventListener('scroll', syncArrows, { passive: true });
        window.addEventListener('resize', syncArrows);

        return () => {
            track?.removeEventListener('scroll', syncArrows);
            window.removeEventListener('resize', syncArrows);
        };
    }, [syncArrows, reviews.length]);

    const scrollByPage = (direction: 1 | -1) => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        track.scrollBy({
            left: direction * track.clientWidth * 0.9,
            behavior: 'smooth',
        });
    };

    if (reviews.length === 0) {
        return null;
    }

    return (
        <section className="bg-band">
            <div className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
                <SectionHeader title={t('reviews.title')} />

                <div className="relative mt-8">
                    <div className="absolute top-1/2 -left-2 z-10 hidden -translate-y-1/2 lg:block">
                        <IconButton
                            variant="outline"
                            label={t('reviews.aria.previous')}
                            disabled={!canScrollBack}
                            onClick={() => scrollByPage(-1)}
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>

                    <ul
                        ref={trackRef}
                        // A labelled, focusable scroll region so it can be
                        // reached and scrolled from the keyboard (§11).
                        tabIndex={0}
                        role="group"
                        aria-label={t('reviews.aria.carousel')}
                        className="flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto pb-2 md:gap-6 [&::-webkit-scrollbar]:hidden"
                    >
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </ul>

                    <div className="absolute top-1/2 -right-2 z-10 hidden -translate-y-1/2 lg:block">
                        <IconButton
                            variant="outline"
                            label={t('reviews.aria.next')}
                            disabled={!canScrollForward}
                            onClick={() => scrollByPage(1)}
                        >
                            <ChevronRightIcon />
                        </IconButton>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ReviewCard({ review }: { review: CustomerReview }) {
    const { t } = useTranslation('home');

    return (
        <li className="w-[85%] shrink-0 snap-start sm:w-[48%] lg:w-[calc((100%-3*1.5rem)/4)]">
            <figure className="flex h-full flex-col gap-4 rounded-card border border-hairline bg-surface p-5">
                <Rating value={review.rating} />

                <blockquote className="flex-1 text-small leading-relaxed text-ink-muted">
                    {review.body}
                </blockquote>

                <figcaption className="flex items-center justify-between gap-3">
                    <span className="text-small text-ink">
                        {t('reviews.attribution', {
                            name: review.customerName,
                            city: review.customerCity,
                        })}
                    </span>

                    <span className="w-9 shrink-0 overflow-hidden rounded-full">
                        <Placeholder
                            ratio="1/1"
                            label=""
                            className="!rounded-full"
                        />
                    </span>
                </figcaption>
            </figure>
        </li>
    );
}
