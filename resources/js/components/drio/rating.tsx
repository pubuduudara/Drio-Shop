import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { StarIcon } from './icons/ui';

export type RatingProps = {
    /** 0–5, halves supported. */
    value: number;
    /** Number of reviews. Omit to render stars alone. */
    count?: number;
    size?: 'sm' | 'md';
    className?: string;
};

const STAR_COUNT = 5;

/**
 * Five gold stars with half-star support and the review count in parentheses
 * (§5.4).
 *
 * The visible count is the bare number the mockup shows; the accessible name
 * spells out the rating and the count in full, so a screen reader is not left
 * with "(128)".
 */
export function Rating({ value, count, size = 'sm', className }: RatingProps) {
    const { t } = useTranslation('common');
    const instanceId = useId();

    const starSize = size === 'md' ? 16 : 14;
    const rounded = Math.round(value * 2) / 2;

    const label = [
        t('rating.aria', { value: rounded }),
        count === undefined ? null : t('rating.reviewCount', { count }),
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <span
            className={cn('inline-flex items-center gap-1.5', className)}
            role="img"
            aria-label={label}
        >
            <span className="inline-flex items-center gap-0.5 text-gold">
                {Array.from({ length: STAR_COUNT }, (_, index) => (
                    <StarIcon
                        key={index}
                        id={`${instanceId}-${index}`}
                        fill={Math.min(Math.max(rounded - index, 0), 1)}
                        width={starSize}
                        height={starSize}
                    />
                ))}
            </span>

            {count !== undefined && (
                <span className="text-small text-ink-muted" aria-hidden>
                    {t('rating.value', { count })}
                </span>
            )}
        </span>
    );
}
