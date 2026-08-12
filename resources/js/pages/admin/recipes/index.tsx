import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { EmptyRow, TableShell, Td, Th, Tr } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { create, destroy, edit, index } from '@/routes/admin/recipes';
import type { Paginated, RecipeRow } from '@/types/admin';

/**
 * The recipes table (§8).
 */
const SEARCH_DEBOUNCE_MS = 300;

export default function RecipesIndex({
    recipes,
    filters,
}: {
    recipes: Paginated<RecipeRow>;
    filters: { search: string };
}) {
    const { t } = useTranslation('admin');
    const [search, setSearch] = useState(filters.search);
    const [pendingDelete, setPendingDelete] = useState<RecipeRow | null>(null);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timer = window.setTimeout(() => {
            router.get(
                index().url,
                { search: search || undefined },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [search]);

    return (
        <>
            <Head title={t('recipes.title')} />

            <PageHeader
                title={t('recipes.title')}
                description={t('recipes.count', { count: recipes.meta.total })}
                actions={
                    <Button size="sm" asChild>
                        <Link href={create()}>{t('recipes.create')}</Link>
                    </Button>
                }
            />

            <div className="mb-3 flex max-w-64 min-w-52 flex-col gap-1.5">
                <label
                    htmlFor="recipe-search"
                    className="text-[13px] font-medium"
                >
                    {t('actions.search')}
                </label>
                <Input
                    id="recipe-search"
                    type="search"
                    value={search}
                    placeholder={t('recipes.searchPlaceholder')}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-8 text-[13px]"
                />
            </div>

            <TableShell>
                <thead>
                    <tr>
                        <Th>{t('recipes.columns.title')}</Th>
                        <Th className="hidden md:table-cell">
                            {t('recipes.columns.slug')}
                        </Th>
                        <Th className="w-24">{t('recipes.columns.time')}</Th>
                        <Th className="w-20">{t('recipes.columns.serves')}</Th>
                        <Th className="w-24">
                            {t('recipes.columns.products')}
                        </Th>
                        <Th className="w-28">{t('recipes.columns.status')}</Th>
                        <Th className="w-24 text-right">
                            {t('recipes.columns.actions')}
                        </Th>
                    </tr>
                </thead>

                <tbody>
                    {recipes.data.length === 0 && (
                        <EmptyRow colSpan={7}>
                            {filters.search
                                ? t('recipes.empty')
                                : t('recipes.emptyAll')}
                        </EmptyRow>
                    )}

                    {recipes.data.map((recipe) => (
                        <Tr key={recipe.id}>
                            <Td>
                                <Link
                                    href={edit(recipe.id)}
                                    className="font-medium text-neutral-900 hover:underline"
                                >
                                    {recipe.title}
                                </Link>
                                <div className="mt-0.5 flex flex-wrap gap-1">
                                    {recipe.isVegetarian && (
                                        <Tag>
                                            {t('recipes.tags.vegetarian')}
                                        </Tag>
                                    )}
                                    {recipe.isTraditional && (
                                        <Tag>
                                            {t('recipes.tags.traditional')}
                                        </Tag>
                                    )}
                                    {recipe.isQuick && (
                                        <Tag>{t('recipes.tags.quick')}</Tag>
                                    )}
                                </div>
                            </Td>
                            <Td className="hidden font-mono text-[12px] text-neutral-500 md:table-cell">
                                {recipe.slug}
                            </Td>
                            <Td className="text-neutral-600 tabular-nums">
                                {recipe.totalMinutes !== null
                                    ? t('recipes.minutes', {
                                          count: recipe.totalMinutes,
                                      })
                                    : '—'}
                            </Td>
                            <Td className="text-neutral-600 tabular-nums">
                                {recipe.serves ?? '—'}
                            </Td>
                            <Td className="text-neutral-600 tabular-nums">
                                {recipe.productsCount}
                            </Td>
                            <Td>
                                <span
                                    className={cn(
                                        'text-[12px]',
                                        recipe.isPublished
                                            ? 'text-emerald-700'
                                            : 'text-neutral-400',
                                    )}
                                >
                                    {recipe.isPublished
                                        ? t('recipes.published')
                                        : t('recipes.draft')}
                                </span>
                            </Td>
                            <Td className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setPendingDelete(recipe)}
                                    className="rounded px-1.5 py-0.5 text-[12px] text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-700"
                                >
                                    {t('actions.delete')}
                                </button>
                            </Td>
                        </Tr>
                    ))}
                </tbody>
            </TableShell>

            <Pagination meta={recipes.meta} links={recipes.links} />

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                name={pendingDelete?.title ?? ''}
                onConfirm={() => {
                    if (pendingDelete) {
                        router.delete(destroy(pendingDelete.id).url);
                    }

                    setPendingDelete(null);
                }}
            />
        </>
    );
}

function Tag({ children }: { children: string }) {
    return (
        <span className="rounded bg-neutral-100 px-1 py-px text-[10px] text-neutral-600">
            {children}
        </span>
    );
}
