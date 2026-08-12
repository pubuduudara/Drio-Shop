import { Head, setLayoutProps } from '@inertiajs/react';
import { BestSellers } from '@/components/storefront/best-sellers';
import { CustomerReviews } from '@/components/storefront/customer-reviews';
import { FeaturedCategories } from '@/components/storefront/featured-categories';
import { FollowOurJourney } from '@/components/storefront/follow-our-journey';
import { Hero } from '@/components/storefront/hero';
import { Newsletter } from '@/components/storefront/newsletter';
import { OurStory } from '@/components/storefront/our-story';
import { RecipeInspiration } from '@/components/storefront/recipe-inspiration';
import { WhyChooseDrio } from '@/components/storefront/why-choose-drio';
import type {
    CategoryCard,
    CustomerReview,
    HeroSlide,
    ProductCard,
    RecipeCard,
} from '@/types/storefront';

/**
 * The homepage (§7.1–7.11).
 *
 * Assembly only. Every section is its own component with its own data
 * contract, so this file stays readable as sections are added or reordered
 * (§2 — no 800-line page files).
 */

type HomePageProps = {
    heroSlides: HeroSlide[];
    categories: CategoryCard[];
    bestSellers: ProductCard[];
    recipes: RecipeCard[];
    reviews: CustomerReview[];
    instagramTileCount: number;
};

export default function HomePage({
    heroSlides,
    categories,
    bestSellers,
    recipes,
    reviews,
    instagramTileCount,
}: HomePageProps) {
    // The only page that opens with a full-bleed hero, so the only one whose
    // header may start transparent (§7.1).
    setLayoutProps({ overlayHeader: true });

    return (
        <>
            <Head title="Authentic Sri Lankan Flavours, Delivered Across Japan" />

            <Hero slides={heroSlides} />
            <FeaturedCategories categories={categories} />
            <BestSellers products={bestSellers} />
            <WhyChooseDrio />
            <OurStory />
            <RecipeInspiration recipes={recipes} />
            <CustomerReviews reviews={reviews} />
            <FollowOurJourney tileCount={instagramTileCount} />
            <Newsletter />
        </>
    );
}
