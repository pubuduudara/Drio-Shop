import type { MediaRecord } from '@/components/drio/media';

/**
 * The shapes the storefront pages receive from the API resources.
 *
 * Every translatable field arrives as a plain string — the resource resolved
 * it in the active locale before it left the server (§9.4), so nothing here
 * needs to know translation exists.
 */

export type CategoryCard = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    /** Key into the drawn SVG set, not a path to an asset (§3). */
    iconKey: string;
    media: MediaRecord | null;
};

export type ProductCard = {
    id: number;
    name: string;
    slug: string;
    shortDescription: string | null;
    /** Integer minor units, always (§2). */
    priceMinor: number;
    compareAtPriceMinor: number | null;
    currency: string;
    rating: number;
    reviewsCount: number;
    isInStock: boolean;
    isVegetarian: boolean;
    media: MediaRecord | null;
};

export type RecipeCard = {
    id: number;
    title: string;
    slug: string;
    intro: string | null;
    totalMinutes: number | null;
    serves: number | null;
    media: MediaRecord | null;
};

export type CustomerReview = {
    id: number;
    customerName: string;
    customerCity: string | null;
    rating: number;
    body: string;
    avatar: MediaRecord | null;
};

export type HeroCta = {
    label: string;
    href: string;
};

export type HeroSlide = {
    id: number;
    /** Authored line breaks, so an editor controls where the headline wraps. */
    headlineLines: string[];
    subhead: string | null;
    primaryCta: HeroCta | null;
    secondaryCta: HeroCta | null;
    media: MediaRecord | null;
};
