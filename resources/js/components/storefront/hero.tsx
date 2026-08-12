import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '@/components/drio/button';
import { Media } from '@/components/drio/media';
import { usePrefersReducedMotion } from '@/hooks/use-reveal';
import { cn } from '@/lib/utils';
import type { HeroSlide } from '@/types/storefront';

/**
 * The hero (§7.2).
 *
 * Full-bleed, ~78vh with a 560px floor, cross-fading between slides every 6s.
 * It pauses on hover and focus, is arrow-key navigable, and stops advancing
 * entirely when the visitor has asked for reduced motion (§11).
 */

const ADVANCE_MS = 6000;

export function Hero({ slides }: { slides: HeroSlide[] }) {
    const { t } = useTranslation(['home', 'common']);
    const prefersReducedMotion = usePrefersReducedMotion();

    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const regionRef = useRef<HTMLElement>(null);

    const slideCount = slides.length;

    const goTo = useCallback(
        (index: number) => {
            setActiveIndex(((index % slideCount) + slideCount) % slideCount);
        },
        [slideCount],
    );

    useEffect(() => {
        if (prefersReducedMotion || isPaused || slideCount <= 1) {
            return;
        }

        const timer = window.setInterval(
            () => setActiveIndex((index) => (index + 1) % slideCount),
            ADVANCE_MS,
        );

        return () => window.clearInterval(timer);
    }, [isPaused, prefersReducedMotion, slideCount]);

    if (slideCount === 0) {
        return null;
    }

    const activeSlide = slides[activeIndex];

    return (
        <section
            ref={regionRef}
            aria-roledescription="carousel"
            aria-label={t('home:hero.aria.carousel')}
            className="relative flex min-h-[560px] items-center overflow-hidden"
            style={{ height: '78vh' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
            onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    goTo(activeIndex + 1);
                }

                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    goTo(activeIndex - 1);
                }
            }}
            tabIndex={-1}
        >
            {/* Slides cross-fade; only the active one is exposed to assistive
                tech, so a screen reader reads one headline rather than three. */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    aria-hidden={index !== activeIndex}
                    className={cn(
                        'absolute inset-0 transition-opacity duration-700 ease-out',
                        index === activeIndex ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    <Media
                        media={slide.media}
                        ratio="21/9"
                        label="Hero — spread of products on wood"
                        // The hero is above the fold, so it loads eagerly (§11).
                        priority={index === 0}
                        className="!absolute inset-0 !aspect-auto h-full w-full"
                        imageClassName="h-full w-full object-cover"
                    />
                </div>
            ))}

            {/*
             * Left-to-right scrim: forest at 82% fading to transparent by 60%
             * of the width, so the headline stays legible over whatever
             * photograph eventually lands here (§7.2).
             */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(to right, color-mix(in srgb, var(--drio-forest) 82%, transparent) 0%, color-mix(in srgb, var(--drio-forest) 45%, transparent) 35%, transparent 60%)',
                }}
                aria-hidden
            />

            <div className="relative mx-auto w-full max-w-drio px-5 md:px-8 lg:px-10">
                {/*
                 * Wide enough that the longest authored line ("Delivered
                 * Across Japan") holds on one line at the top of the §5 type
                 * scale. The scale wins over the mockup's slightly smaller
                 * headline per the precedence table in §0.
                 */}
                <div className="max-w-3xl pt-16">
                    <h1 className="font-display text-hero font-medium text-cream">
                        {activeSlide.headlineLines.map((line, index) => (
                            <span key={index} className="block">
                                {line}
                            </span>
                        ))}
                    </h1>

                    {activeSlide.subhead && (
                        <p className="mt-6 max-w-md text-copy text-cream/85">
                            {activeSlide.subhead}
                        </p>
                    )}

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        {activeSlide.primaryCta && (
                            <ButtonLink
                                href={activeSlide.primaryCta.href}
                                variant="primary"
                                size="lg"
                            >
                                {activeSlide.primaryCta.label}
                            </ButtonLink>
                        )}
                        {activeSlide.secondaryCta && (
                            <ButtonLink
                                href={activeSlide.secondaryCta.href}
                                variant="dark"
                                size="lg"
                                withArrow
                            >
                                {activeSlide.secondaryCta.label}
                            </ButtonLink>
                        )}
                    </div>
                </div>
            </div>

            {slideCount > 1 && (
                <div className="absolute inset-x-0 bottom-8 mx-auto max-w-drio px-5 md:px-8 lg:px-10">
                    <div className="flex items-center justify-end gap-4">
                        <span
                            className="drio-eyebrow text-cream/70"
                            aria-live="polite"
                        >
                            <span className="text-gold">
                                {String(activeIndex + 1).padStart(2, '0')}
                            </span>
                            {' / '}
                            {String(slideCount).padStart(2, '0')}
                        </span>

                        {/* The gold progress rule beside the counter (§7.2). */}
                        <span className="relative h-px w-24 overflow-hidden bg-cream/25">
                            <span
                                className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-500"
                                style={{
                                    width: `${((activeIndex + 1) / slideCount) * 100}%`,
                                }}
                            />
                        </span>
                    </div>

                    {/* Real buttons so the carousel is operable without a
                        pointer, beyond the arrow-key handler above (§11). */}
                    <div className="sr-only">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                type="button"
                                onClick={() => goTo(index)}
                                aria-current={index === activeIndex}
                            >
                                {t('home:hero.aria.goToSlide', {
                                    index: index + 1,
                                })}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
