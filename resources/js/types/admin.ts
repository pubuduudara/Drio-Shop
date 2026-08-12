import type { MediaRecord } from '@/components/drio/media';

/**
 * The shapes the admin console receives from `App\Http\Resources\Admin`.
 *
 * Note the split between the row and form shapes of a record: rows carry
 * translatable fields already resolved to strings, while form shapes carry the
 * full `{locale: value}` map. That is the one §9.4 exception, and the type
 * system is where it stays visible.
 */

/** A translatable value as the admin edits it: one entry per enabled locale. */
export type Translations = Record<string, string>;

export type PaginationMeta = {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number | null;
    to: number | null;
};

export type Paginated<T> = {
    data: T[];
    meta: PaginationMeta;
    links: { prev: string | null; next: string | null };
};

export type AdminMedia = {
    id: number;
    url: string;
    name: string;
    sizeBytes: number;
    order: number | null;
};

export type ProductRow = {
    id: number;
    name: string;
    slug: string;
    sku: string;
    categoryName?: string;
    priceMinor: number;
    compareAtPriceMinor: number | null;
    currency: string;
    stockQuantity: number;
    isLowStock: boolean;
    isActive: boolean;
    isBestSeller: boolean;
    media: MediaRecord | null;
};

export type ProductForm = {
    id: number;
    name: Translations;
    shortDescription: Translations;
    description: Translations;
    slug: string;
    sku: string;
    categoryId: number;
    priceMinor: number;
    compareAtPriceMinor: number | null;
    currency: string;
    weightGrams: number | null;
    stockQuantity: number;
    sortOrder: number;
    isActive: boolean;
    isBestSeller: boolean;
    isVegetarian: boolean;
    gallery: AdminMedia[];
    /** The gallery row the primary copy came from, or null. */
    primaryMediaId: number | null;
};

export type CategoryRow = {
    id: number;
    name: string;
    slug: string;
    iconKey: string;
    isFeatured: boolean;
    sortOrder: number;
    productsCount: number;
};

export type CategoryForm = {
    id: number;
    name: Translations;
    description: Translations;
    slug: string;
    iconKey: string;
    isFeatured: boolean;
    sortOrder: number;
};

export type ProductFilters = {
    search: string;
    category: number | null;
    status: string;
};

export type OrderStatusCount = {
    status: string;
    count: number;
};

export type RecentOrder = {
    id: number;
    orderNumber: string;
    customerName: string;
    status: string;
    totalMinor: number;
    currency: string;
    placedAt: string;
};

export type BestSellingProduct = {
    id: number;
    name: string;
    unitsSold: number;
};

export type OrderRow = {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    status: string;
    itemCount: number;
    totalMinor: number;
    currency: string;
    placedAt: string | null;
};

export type RecipeRow = {
    id: number;
    title: string;
    slug: string;
    totalMinutes: number | null;
    serves: number | null;
    isPublished: boolean;
    isVegetarian: boolean;
    isTraditional: boolean;
    isQuick: boolean;
    productsCount: number;
};

/** A translatable list: one array of strings per enabled locale. */
export type TranslatedList = Record<string, string[]>;

export type RecipeForm = {
    id: number;
    title: Translations;
    intro: Translations;
    ingredients: TranslatedList;
    steps: TranslatedList;
    slug: string;
    prepMinutes: number | null;
    cookMinutes: number | null;
    serves: number | null;
    sortOrder: number;
    isVegetarian: boolean;
    isTraditional: boolean;
    isQuick: boolean;
    isPublished: boolean;
    productIds: number[];
};

export type ReviewRow = {
    id: number;
    customerName: string;
    customerCity: string | null;
    rating: number;
    body: string;
    isPublished: boolean;
    isFeatured: boolean;
    productId: number | null;
    productName?: string | null;
    submittedAt: string | null;
};

export type HeroSlide = {
    id: number;
    headline: Translations;
    subhead: Translations;
    primaryCtaLabel: Translations;
    secondaryCtaLabel: Translations;
    primaryCtaHref: string | null;
    secondaryCtaHref: string | null;
    sortOrder: number;
    isActive: boolean;
    /** Resolved in the active locale, for the list's preview line. */
    resolvedHeadline: string;
    media: MediaRecord | null;
};

export type SubscriberRow = {
    id: number;
    email: string;
    locale: string;
    confirmedAt: string | null;
    subscribedAt: string | null;
};

export type StoreSettings = {
    shipping_flat_rate_minor: number;
    free_shipping_threshold_minor: number;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    instagram_handle: string;
    instagram_url: string;
    facebook_url: string;
    youtube_url: string;
};
