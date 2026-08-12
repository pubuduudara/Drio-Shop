import { useEffect, useRef, useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void): () => void {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);

    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
}

/**
 * Whether the visitor has asked for reduced motion (§11).
 *
 * Every animation in the storefront — reveals, the hero's auto-advance, the
 * review carousel — reads this rather than assuming motion is welcome.
 *
 * Subscribed rather than mirrored into state, so the preference is read during
 * render instead of one paint late.
 */
export function usePrefersReducedMotion(): boolean {
    return useSyncExternalStore(
        subscribeToReducedMotion,
        () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
        () => false,
    );
}

/**
 * Fade-and-rise on scroll into view (§4): 16px, 400ms, ease-out, with an
 * optional stagger across grid children.
 *
 * The offsets live in the `drio-reveal` CSS utility; this only flips the
 * `data-reveal` attribute once, so an element never animates back out as the
 * visitor scrolls past it a second time.
 */
export function useReveal<T extends HTMLElement>({
    /** Milliseconds to delay this element, e.g. `index * 60` across a grid. */
    delay = 0,
}: { delay?: number } = {}) {
    const ref = useRef<T>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        if (prefersReducedMotion) {
            element.dataset.reveal = 'shown';

            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) {
                        continue;
                    }

                    window.setTimeout(() => {
                        element.dataset.reveal = 'shown';
                    }, delay);

                    observer.unobserve(entry.target);
                }
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [delay, prefersReducedMotion]);

    return ref;
}
