import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { iconAccessibilityProps } from './icons/icon';
import type { IconProps } from './icons/icon';

/**
 * The leaf mark that sits above the wordmark's final letter (§7.1).
 */
export function LeafMark({ title, ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 20"
            width="18"
            height="15"
            fill="none"
            {...iconAccessibilityProps(title)}
            {...props}
        >
            <path
                d="M22 2c0 9.4-4.4 14.2-11 14.2A6.2 6.2 0 0 1 4.6 10C4.6 4.6 10.4 2 22 2Z"
                fill="currentColor"
                opacity="0.9"
            />
            <path
                d="M18.4 5.2C13 7.4 9 11.6 6.2 18.4"
                stroke="var(--drio-cream)"
                strokeWidth="1"
                strokeLinecap="round"
            />
        </svg>
    );
}

type WordmarkProps = {
    /**
     * `light` for the transparent-over-hero and footer treatments, `dark` for
     * cream surfaces. The mark inherits the surrounding text colour otherwise.
     */
    tone?: 'light' | 'dark';
    /** Renders the `SRI LANKAN FLAVOURS` utility line beneath (§7.1). */
    showTagline?: boolean;
    className?: string;
};

/**
 * The DRIO wordmark: display serif, with the drawn leaf mark and the optional
 * tagline in utility type.
 *
 * The brand name itself is not translated, but the tagline is — it reads as
 * copy, not as a logotype, so it comes from the dictionary like everything
 * else (§9.3).
 */
export function Wordmark({
    tone = 'dark',
    showTagline = true,
    className,
}: WordmarkProps) {
    const { t } = useTranslation('common');

    return (
        <span
            className={cn(
                'inline-flex flex-col items-start leading-none',
                className,
            )}
        >
            <span className="relative inline-flex items-start">
                <span
                    className={cn(
                        'font-display text-[1.75rem] leading-none font-semibold tracking-[0.06em]',
                        tone === 'light' ? 'text-cream' : 'text-ink',
                    )}
                >
                    {t('brand.name')}
                </span>
                <LeafMark
                    className="absolute -top-1.5 -right-3.5 text-gold"
                    aria-hidden
                />
            </span>

            {showTagline && (
                <span
                    className={cn(
                        'mt-1.5 drio-eyebrow',
                        tone === 'light' ? 'text-cream/70' : 'text-ink-muted',
                    )}
                >
                    {t('brand.tagline')}
                </span>
            )}
        </span>
    );
}
