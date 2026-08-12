import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from '@/components/drio/icons/ui';
import { Media } from '@/components/drio/media';
import { SectionHeader } from '@/components/drio/section-header';
import { useReveal } from '@/hooks/use-reveal';
import { index as recipesIndex, show as recipeShow } from '@/routes/recipes';
import type { RecipeCard } from '@/types/storefront';

/**
 * Recipe Inspiration (§7.7). Four 4/3 media cards with a bottom-up scrim and
 * the title and link overlaid on the image.
 */
export function RecipeInspiration({ recipes }: { recipes: RecipeCard[] }) {
    const { t } = useTranslation(['home', 'common']);

    if (recipes.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
            <SectionHeader
                title={t('home:recipes.title')}
                viewAllHref={recipesIndex()}
                viewAllLabel={t('common:viewAll.recipes')}
            />

            <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
                {recipes.map((recipe, index) => (
                    <RecipeTile key={recipe.id} recipe={recipe} index={index} />
                ))}
            </ul>
        </section>
    );
}

function RecipeTile({ recipe, index }: { recipe: RecipeCard; index: number }) {
    const { t } = useTranslation('common');
    const ref = useReveal<HTMLLIElement>({ delay: index * 60 });

    return (
        <li ref={ref} className="drio-reveal">
            <Link
                href={recipeShow(recipe.slug)}
                className="group/recipe relative block overflow-hidden rounded-card"
            >
                <Media
                    media={recipe.media}
                    ratio="4/3"
                    label={`Recipe — ${recipe.title}`}
                    // The title and link are overlaid across the lower half.
                    captionPlacement="top"
                    imageClassName="transition-transform duration-[600ms] ease-media group-hover/recipe:scale-[1.03]"
                    className="transition-transform duration-[600ms] ease-media group-hover/recipe:scale-[1.03]"
                />

                {/* Bottom-up scrim, deepening on hover (§7.7). */}
                <span
                    className="absolute inset-0 opacity-90 transition-opacity duration-300 group-hover/recipe:opacity-100"
                    style={{
                        background:
                            'linear-gradient(to top, color-mix(in srgb, var(--drio-forest) 88%, transparent) 0%, color-mix(in srgb, var(--drio-forest) 35%, transparent) 45%, transparent 70%)',
                    }}
                    aria-hidden
                />

                <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
                    <span className="font-display text-xl leading-tight font-medium text-cream">
                        {recipe.title}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-small text-cream/85">
                        {t('actions.viewRecipe')}
                        <ArrowRightIcon
                            width={14}
                            height={14}
                            className="transition-transform duration-200 group-hover/recipe:translate-x-[3px]"
                        />
                    </span>
                </span>
            </Link>
        </li>
    );
}
