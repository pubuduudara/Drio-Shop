import type { MediaRecord } from '@/components/drio/media';
import type { ProductCard } from '@/types/storefront';

/**
 * The detail-page shapes, kept beside the card shapes in `storefront.ts`.
 *
 * As everywhere on the storefront, translatable fields arrive as plain strings
 * — the resource resolved them in the active locale before they left the
 * server (§9.4).
 */

export type ProductDetail = {
    id: number;
    name: string;
    slug: string;
    shortDescription: string | null;
    description: string | null;
    sku: string;
    priceMinor: number;
    compareAtPriceMinor: number | null;
    currency: string;
    weightGrams: number | null;
    stockQuantity: number;
    isInStock: boolean;
    isLowStock: boolean;
    isVegetarian: boolean;
    rating: number;
    reviewsCount: number;
    category?: { name: string; slug: string };
    /**
     * Always at least one entry. A `null` entry means no photograph has been
     * uploaded yet and `<Media />` should render the labelled placeholder (§3).
     */
    gallery: (MediaRecord | null)[];
};

export type RecipeDetail = {
    id: number;
    title: string;
    slug: string;
    intro: string | null;
    ingredients: string[];
    steps: string[];
    prepMinutes: number | null;
    cookMinutes: number | null;
    totalMinutes: number | null;
    serves: number | null;
    isVegetarian: boolean;
    isTraditional: boolean;
    isQuick: boolean;
    media: MediaRecord | null;
    products: ProductCard[];
};
