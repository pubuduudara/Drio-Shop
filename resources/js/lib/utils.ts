import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge only knows Tailwind's stock scales. Without being told about
 * the DRIO theme it cannot tell a custom font size from a custom colour, so it
 * files `text-small` and `text-cream` in the same conflict group and silently
 * drops whichever came first — leaving buttons with no text colour at all.
 *
 * Registering the theme here fixes that for every caller of `cn`, which is the
 * only place these decisions should live.
 */
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            color: [
                'forest',
                'forest-700',
                'forest-500',
                'gold',
                'gold-600',
                'gold-700',
                'gold-200',
                'cream',
                'sand',
                'paper',
                'line',
                'ink',
                'ink-muted',
                'chilli',
                'clay',
                'clay-700',
                // Semantic aliases (§5)
                'page',
                'surface',
                'band',
                'body',
                'hairline',
            ],
            // Font sizes. Deliberately share no name with a colour above, so
            // `text-*` is never ambiguous between size and colour.
            text: ['hero', 'section', 'title', 'copy', 'small', 'eyebrow'],
            font: ['display', 'body'],
            radius: ['btn', 'card', 'panel'],
            container: ['drio'],
            ease: ['drio', 'media'],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}
