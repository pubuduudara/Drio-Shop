import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from '@/components/drio/icons/ui';
import { Media } from '@/components/drio/media';
import { StorefrontPageHeader } from '@/components/storefront/page-header';
import { StorefrontPagination } from '@/components/storefront/storefront-pagination';
import { useReveal } from '@/hooks/use-reveal';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { index as recipesIndex, show as recipeShow } from '@/routes/recipes';
import type { Paginated } from '@/types/admin';
import type { RecipeCard } from '@/types/storefront';

/**
 * The recipe index (§7.12).
 *
 * The diet filters match the footer's Recipes column, so those links land on a
 * real filtered view rather than dropping the visitor on the unfiltered index.
 */
export default function RecipesIndex({
    recipes,
    filters,
    diets,
}: {
    recipes: Paginated<RecipeCard>;
    filters: { diet: string | null };
    diets: string[];
}) {
    const { t } = useTranslation(['recipe', 'nav']);

    return (
        <>
            <Head title={t('recipe:title')} />

            <StorefrontPageHeader
                eyebrow={t('recipe:eyebrow')}
                title={t('recipe:title')}
                description={t('recipe:description')}
                crumbs={[
                    { label: t('nav:primary.home'), href: home().url },
                    { label: t('recipe:title') },
                ]}
            >
                <nav
                    aria-label={t('recipe:title')}
                    className="mt-6 flex flex-wrap items-center gap-2"
                >
                    <FilterPill
                        href={recipesIndex().url}
                        label={t('recipe:filters.all')}
                        isActive={filters.diet === null}
                    />
                    {diets.map((diet) => (
                        <FilterPill
                            key={diet}
                            href={recipesIndex({ query: { diet } }).url}
                            label={t(`recipe:filters.${diet}`)}
                            isActive={filters.diet === diet}
                        />
                    ))}
                </nav>
            </StorefrontPageHeader>

            <div className="mx-auto max-w-drio px-5 py-10 md:px-8 md:py-12 lg:px-10">
                {recipes.data.length === 0 ? (
                    <p className="rounded-card border border-hairline bg-surface px-6 py-12 text-center text-copy text-ink-muted">
                        {t('recipe:empty')}
                    </p>
                ) : (
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
                        {recipes.data.map((recipe, index) => (
                            <RecipeTile
                                key={recipe.id}
                                recipe={recipe}
                                index={index}
                            />
                        ))}
                    </ul>
                )}

                <StorefrontPagination
                    meta={recipes.meta}
                    links={recipes.links}
                    className="mt-10"
                />
            </div>
        </>
    );
}

function FilterPill({
    href,
    label,
    isActive,
}: {
    href: string;
    label: string;
    isActive: boolean;
}) {
    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            preserveScroll
            className={cn(
                'rounded-btn border px-3.5 py-1.5 text-small transition-colors',
                isActive
                    ? 'border-ink bg-ink text-cream'
                    : 'border-hairline bg-surface text-ink-muted hover:border-ink/40 hover:text-ink',
            )}
        >
            {label}
        </Link>
    );
}

/**
 * The same tile as the homepage's Recipe Inspiration row (§7.7) — one visual
 * language for a recipe wherever it appears.
 */
function RecipeTile({ recipe, index }: { recipe: RecipeCard; index: number }) {
    const { t } = useTranslation(['common', 'recipe']);
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
                    captionPlacement="top"
                    imageClassName="transition-transform duration-[600ms] ease-media group-hover/recipe:scale-[1.03]"
                    className="transition-transform duration-[600ms] ease-media group-hover/recipe:scale-[1.03]"
                />

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

                    {recipe.totalMinutes !== null && (
                        <span className="drio-eyebrow text-gold-200">
                            {t('recipe:meta.minutes', {
                                count: recipe.totalMinutes,
                            })}
                        </span>
                    )}

                    <span className="inline-flex items-center gap-1.5 text-small text-cream/85">
                        {t('common:actions.viewRecipe')}
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
