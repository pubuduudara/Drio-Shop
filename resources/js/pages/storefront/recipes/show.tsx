import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/drio/badge';
import { Media } from '@/components/drio/media';
import { SectionHeader } from '@/components/drio/section-header';
import { ProductGrid } from '@/components/storefront/product-grid';
import { RecipeInspiration } from '@/components/storefront/recipe-inspiration';
import { home } from '@/routes';
import { index as recipesIndex } from '@/routes/recipes';
import type { RecipeCard } from '@/types/storefront';
import type { RecipeDetail } from '@/types/storefront-detail';

/**
 * A recipe (§7.12), with the "shop the ingredients" block that links it back
 * to the products it uses.
 */
export default function RecipeShow({
    recipe,
    more,
}: {
    recipe: RecipeDetail;
    more: RecipeCard[];
}) {
    const { t } = useTranslation(['recipe', 'nav', 'common']);

    const tags = [
        recipe.isVegetarian && 'vegetarian',
        recipe.isTraditional && 'traditional',
        recipe.isQuick && 'quick',
    ].filter((tag): tag is string => Boolean(tag));

    return (
        <>
            <Head title={recipe.title} />

            <div className="mx-auto max-w-drio px-5 pt-28 pb-12 md:px-8 md:pt-32 lg:px-10">
                <nav
                    aria-label={t('common:aria.breadcrumb')}
                    className="text-small text-ink-muted"
                >
                    <ol className="flex flex-wrap items-center gap-1.5">
                        <li>
                            <Link href={home()} className="hover:text-gold-700">
                                {t('nav:primary.home')}
                            </Link>
                        </li>
                        <li aria-hidden>/</li>
                        <li>
                            <Link
                                href={recipesIndex()}
                                className="hover:text-gold-700"
                            >
                                {t('recipe:title')}
                            </Link>
                        </li>
                        <li aria-hidden>/</li>
                        <li aria-current="page" className="text-ink">
                            {recipe.title}
                        </li>
                    </ol>
                </nav>

                <header className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
                    <div className="overflow-hidden rounded-panel border border-hairline">
                        <Media
                            media={recipe.media}
                            ratio="4/3"
                            label={`Recipe — ${recipe.title}`}
                            priority
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <h1 className="font-display text-section font-medium text-ink">
                            {recipe.title}
                        </h1>

                        {tags.length > 0 && (
                            <ul className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <li key={tag}>
                                        <Badge variant="clay">
                                            {t(`recipe:tags.${tag}`)}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {recipe.intro && (
                            <p className="text-copy text-ink-muted">
                                {recipe.intro}
                            </p>
                        )}

                        <dl className="grid grid-cols-2 gap-3 border-t border-hairline pt-4 sm:grid-cols-4">
                            {recipe.prepMinutes !== null && (
                                <Stat
                                    label={t('recipe:meta.prep')}
                                    value={t('recipe:meta.minutes', {
                                        count: recipe.prepMinutes,
                                    })}
                                />
                            )}
                            {recipe.cookMinutes !== null && (
                                <Stat
                                    label={t('recipe:meta.cook')}
                                    value={t('recipe:meta.minutes', {
                                        count: recipe.cookMinutes,
                                    })}
                                />
                            )}
                            {recipe.totalMinutes !== null && (
                                <Stat
                                    label={t('recipe:meta.total')}
                                    value={t('recipe:meta.minutes', {
                                        count: recipe.totalMinutes,
                                    })}
                                />
                            )}
                            {recipe.serves !== null && (
                                <Stat
                                    label={t('recipe:meta.serves')}
                                    value={t('recipe:meta.servesValue', {
                                        count: recipe.serves,
                                    })}
                                />
                            )}
                        </dl>
                    </div>
                </header>

                <div className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
                    <section aria-labelledby="ingredients">
                        <h2
                            id="ingredients"
                            className="font-display text-2xl font-medium text-ink"
                        >
                            {t('recipe:ingredients')}
                        </h2>

                        <ul className="mt-4 flex flex-col gap-2.5 border-t border-hairline pt-4">
                            {recipe.ingredients.map((ingredient) => (
                                <li
                                    key={ingredient}
                                    className="flex gap-3 text-copy text-ink-muted"
                                >
                                    <span
                                        className="mt-2.5 size-1 shrink-0 rounded-full bg-gold"
                                        aria-hidden
                                    />
                                    {ingredient}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section aria-labelledby="method">
                        <h2
                            id="method"
                            className="font-display text-2xl font-medium text-ink"
                        >
                            {t('recipe:steps')}
                        </h2>

                        <ol className="mt-4 flex flex-col gap-5 border-t border-hairline pt-4">
                            {recipe.steps.map((step, index) => (
                                <li key={step} className="flex gap-4">
                                    <span className="shrink-0 drio-eyebrow text-gold-700">
                                        {t('recipe:step', {
                                            number: index + 1,
                                        })}
                                    </span>
                                    <p className="text-copy text-ink-muted">
                                        {step}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>
            </div>

            {/* Shop the ingredients (§7.12). */}
            <section className="bg-band">
                <div className="mx-auto max-w-drio px-5 py-16 md:px-8 md:py-20 lg:px-10">
                    <SectionHeader title={t('recipe:shopIngredients.title')} />

                    <p className="mt-3 max-w-xl text-copy text-ink-muted">
                        {t('recipe:shopIngredients.description')}
                    </p>

                    <div className="mt-8">
                        <ProductGrid
                            products={recipe.products}
                            emptyMessage={t('recipe:shopIngredients.empty')}
                            columns={4}
                        />
                    </div>
                </div>
            </section>

            {more.length > 0 && <RecipeInspiration recipes={more} />}
        </>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="drio-eyebrow text-ink-muted">{label}</dt>
            <dd className="mt-1 text-copy text-ink">{value}</dd>
        </div>
    );
}
