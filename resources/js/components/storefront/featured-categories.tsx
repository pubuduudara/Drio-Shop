import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { CategoryIcon } from '@/components/drio/icons/category';
import { ArrowRightIcon } from '@/components/drio/icons/ui';
import { Media } from '@/components/drio/media';
import { SectionHeader } from '@/components/drio/section-header';
import { useReveal } from '@/hooks/use-reveal';
import { shop } from '@/routes';
import { show as categoryShow } from '@/routes/categories';
import type { CategoryCard } from '@/types/storefront';

/**
 * Featured Categories (§7.3).
 *
 * Four cards, 4/3 media bleeding to the card edges, with a forest-700 circle
 * badge at the lower-left of the media overlapping into the caption.
 */
export function FeaturedCategories({
    categories,
}: {
    categories: CategoryCard[];
}) {
    const { t } = useTranslation(['home', 'common']);

    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
            <SectionHeader
                title={t('home:categories.title')}
                viewAllHref={shop()}
                viewAllLabel={t('common:viewAll.categories')}
            />

            <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
                {categories.map((category, index) => (
                    <CategoryTile
                        key={category.id}
                        category={category}
                        index={index}
                    />
                ))}
            </ul>
        </section>
    );
}

function CategoryTile({
    category,
    index,
}: {
    category: CategoryCard;
    index: number;
}) {
    const { t } = useTranslation('common');
    // 60ms stagger across grid children (§4).
    const ref = useReveal<HTMLLIElement>({ delay: index * 60 });

    return (
        <li ref={ref} className="drio-reveal">
            <Link
                href={categoryShow(category.slug)}
                className="group/card block overflow-hidden rounded-card border border-hairline bg-surface transition-shadow duration-300 hover:shadow-[0_2px_10px_rgba(38,34,29,0.07)]"
            >
                <div className="relative">
                    <div className="overflow-hidden">
                        <Media
                            media={category.media}
                            ratio="4/3"
                            label={`Category — ${category.name}`}
                            imageClassName="transition-transform duration-[600ms] ease-media group-hover/card:scale-[1.03]"
                            className="transition-transform duration-[600ms] ease-media group-hover/card:scale-[1.03]"
                        />
                    </div>

                    {/* Overlaps the media into the caption area, as the
                        reference shows. */}
                    <span className="absolute -bottom-5 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-forest-700 text-white">
                        <CategoryIcon iconKey={category.iconKey} />
                    </span>
                </div>

                <div className="px-4 pt-8 pb-5">
                    <h3 className="font-display text-xl leading-tight font-medium text-ink">
                        {category.name}
                    </h3>

                    <span className="mt-3 inline-flex items-center gap-1.5 drio-eyebrow text-gold-700">
                        {t('actions.exploreCollection')}
                        <ArrowRightIcon
                            width={13}
                            height={13}
                            className="transition-transform duration-200 group-hover/card:translate-x-[3px]"
                        />
                    </span>
                </div>
            </Link>
        </li>
    );
}
