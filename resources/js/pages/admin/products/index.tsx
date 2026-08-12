import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { AdminSelect } from '@/components/admin/form';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { EmptyRow, TableShell, Td, Th, Tr } from '@/components/admin/table';
import { formatPrice } from '@/components/drio/price';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import {
    bulk,
    create,
    destroy,
    edit,
    index,
    quickUpdate,
} from '@/routes/admin/products';
import type {
    CategoryRow,
    Paginated,
    ProductFilters,
    ProductRow,
} from '@/types/admin';

/**
 * The products table (§8).
 *
 * Search, category and status filters live in the URL, so a filtered view is
 * shareable and survives a refresh. Price and stock are editable in the row
 * itself — the client reprices and restocks constantly, and making that cost a
 * page load each time would be the console's worst habit.
 */

type Props = {
    products: Paginated<ProductRow>;
    categories: CategoryRow[];
    filters: ProductFilters;
};

const SEARCH_DEBOUNCE_MS = 300;

export default function ProductsIndex({
    products,
    categories,
    filters,
}: Props) {
    const { t } = useTranslation('admin');

    const [search, setSearch] = useState(filters.search);
    const [selected, setSelected] = useState<number[]>([]);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<ProductRow | null>(null);

    // The first render must not re-issue the request that produced this page.
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timer = window.setTimeout(() => {
            applyFilters({ ...filters, search });
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const rows = products.data;
    const allSelected = rows.length > 0 && selected.length === rows.length;

    const categoryOptions = useMemo(
        () =>
            categories.map((category) => ({
                value: String(category.id),
                label: category.name,
            })),
        [categories],
    );

    const hasFilters =
        filters.search !== '' ||
        filters.category !== null ||
        filters.status !== '';

    return (
        <>
            <Head title={t('products.title')} />

            <PageHeader
                title={t('products.title')}
                description={t('products.count', {
                    count: products.meta.total,
                })}
                actions={
                    <Button size="sm" asChild>
                        <Link href={create()}>{t('products.create')}</Link>
                    </Button>
                }
            />

            <div className="mb-3 flex flex-wrap items-end gap-2">
                <div className="flex min-w-52 flex-col gap-1.5">
                    <label
                        htmlFor="product-search"
                        className="text-[13px] font-medium"
                    >
                        {t('actions.search')}
                    </label>
                    <Input
                        id="product-search"
                        type="search"
                        value={search}
                        placeholder={t('products.searchPlaceholder')}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-8 text-[13px]"
                    />
                </div>

                <AdminSelect
                    label={t('products.columns.category')}
                    className="min-w-44"
                    value={filters.category ? String(filters.category) : ''}
                    placeholder={t('products.allCategories')}
                    options={categoryOptions}
                    onChange={(event) =>
                        applyFilters({
                            ...filters,
                            search,
                            category: event.target.value
                                ? Number(event.target.value)
                                : null,
                        })
                    }
                />

                <AdminSelect
                    label={t('products.columns.status')}
                    className="min-w-36"
                    value={filters.status}
                    placeholder={t('products.allStatuses')}
                    options={[
                        { value: 'active', label: t('products.active') },
                        { value: 'inactive', label: t('products.inactive') },
                    ]}
                    onChange={(event) =>
                        applyFilters({
                            ...filters,
                            search,
                            status: event.target.value,
                        })
                    }
                />

                {hasFilters && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setSearch('');
                            applyFilters({
                                search: '',
                                category: null,
                                status: '',
                            });
                        }}
                    >
                        {t('actions.clear')}
                    </Button>
                )}
            </div>

            {selected.length > 0 && (
                <div
                    className="mb-2 flex flex-wrap items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2"
                    aria-live="polite"
                >
                    <span className="font-medium">
                        {t('products.selected', { count: selected.length })}
                    </span>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            runBulk('activate', selected, setSelected)
                        }
                    >
                        {t('products.bulk.activate')}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            runBulk('deactivate', selected, setSelected)
                        }
                    >
                        {t('products.bulk.deactivate')}
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setBulkDeleteOpen(true)}
                    >
                        {t('products.bulk.delete')}
                    </Button>
                </div>
            )}

            <TableShell>
                <thead>
                    <tr>
                        <Th className="w-8">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                aria-label={t('products.selectAll')}
                                onChange={(event) =>
                                    setSelected(
                                        event.target.checked
                                            ? rows.map((row) => row.id)
                                            : [],
                                    )
                                }
                                className="size-3.5 accent-neutral-900"
                            />
                        </Th>
                        <Th className="w-12">
                            <span className="sr-only">
                                {t('products.columns.image')}
                            </span>
                        </Th>
                        <Th>{t('products.columns.name')}</Th>
                        <Th className="hidden md:table-cell">
                            {t('products.columns.sku')}
                        </Th>
                        <Th className="hidden lg:table-cell">
                            {t('products.columns.category')}
                        </Th>
                        <Th className="w-32">{t('products.columns.price')}</Th>
                        <Th className="w-28">{t('products.columns.stock')}</Th>
                        <Th className="w-24">{t('products.columns.status')}</Th>
                        <Th className="w-24 text-right">
                            {t('products.columns.actions')}
                        </Th>
                    </tr>
                </thead>

                <tbody>
                    {rows.length === 0 && (
                        <EmptyRow colSpan={9}>
                            {hasFilters
                                ? t('products.empty')
                                : t('products.emptyCatalogue')}
                        </EmptyRow>
                    )}

                    {rows.map((product) => (
                        <ProductTableRow
                            key={product.id}
                            product={product}
                            isSelected={selected.includes(product.id)}
                            onToggleSelect={() =>
                                setSelected((current) =>
                                    current.includes(product.id)
                                        ? current.filter(
                                              (id) => id !== product.id,
                                          )
                                        : [...current, product.id],
                                )
                            }
                            onDelete={() => setPendingDelete(product)}
                        />
                    ))}
                </tbody>
            </TableShell>

            <Pagination meta={products.meta} links={products.links} />

            <ConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                name={t('products.bulk.confirmTitle', {
                    count: selected.length,
                })}
                description={t('products.bulk.confirmBody')}
                onConfirm={() => {
                    runBulk('delete', selected, setSelected);
                    setBulkDeleteOpen(false);
                }}
            />

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                name={pendingDelete?.name ?? ''}
                onConfirm={() => {
                    if (pendingDelete) {
                        router.delete(destroy(pendingDelete.id).url, {
                            preserveScroll: true,
                        });
                    }

                    setPendingDelete(null);
                }}
            />
        </>
    );
}

/** One row, including the inline price and stock editors. */
function ProductTableRow({
    product,
    isSelected,
    onToggleSelect,
    onDelete,
}: {
    product: ProductRow;
    isSelected: boolean;
    onToggleSelect: () => void;
    onDelete: () => void;
}) {
    const { t } = useTranslation('admin');
    const { locale } = useLocale();

    return (
        <Tr className={cn(isSelected && 'bg-neutral-50')}>
            <Td>
                <input
                    type="checkbox"
                    checked={isSelected}
                    aria-label={t('products.selectOne', {
                        name: product.name,
                    })}
                    onChange={onToggleSelect}
                    className="size-3.5 accent-neutral-900"
                />
            </Td>

            <Td>
                {product.media ? (
                    <img
                        src={product.media.url}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        className="size-8 rounded object-cover"
                    />
                ) : (
                    <span
                        className="block size-8 rounded bg-sand"
                        aria-hidden
                    />
                )}
            </Td>

            <Td>
                <Link
                    href={edit(product.id)}
                    className="font-medium text-neutral-900 hover:underline"
                >
                    {product.name}
                </Link>
                {product.isBestSeller && (
                    <span className="ml-1.5 rounded bg-amber-100 px-1 py-px text-[10px] font-medium text-amber-800">
                        {t('products.bestSeller')}
                    </span>
                )}
            </Td>

            <Td className="hidden font-mono text-[12px] text-neutral-500 md:table-cell">
                {product.sku}
            </Td>

            <Td className="hidden text-neutral-600 lg:table-cell">
                {product.categoryName}
            </Td>

            <Td>
                <QuickEditCell
                    value={product.priceMinor}
                    label={t('products.quickEdit.price', {
                        name: product.name,
                    })}
                    display={formatPrice(
                        product.priceMinor,
                        product.currency,
                        locale,
                    )}
                    onSave={(value) =>
                        saveQuickEdit(product, { price_minor: value })
                    }
                />
            </Td>

            <Td>
                <div className="flex items-center gap-1.5">
                    <QuickEditCell
                        value={product.stockQuantity}
                        label={t('products.quickEdit.stock', {
                            name: product.name,
                        })}
                        display={String(product.stockQuantity)}
                        onSave={(value) =>
                            saveQuickEdit(product, { stock_quantity: value })
                        }
                    />
                    {product.stockQuantity === 0 ? (
                        <span className="rounded bg-red-100 px-1 py-px text-[10px] font-medium text-red-700">
                            {t('products.outOfStock')}
                        </span>
                    ) : (
                        product.isLowStock && (
                            <span className="rounded bg-amber-100 px-1 py-px text-[10px] font-medium text-amber-800">
                                {t('products.lowStock')}
                            </span>
                        )
                    )}
                </div>
            </Td>

            <Td>
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 text-[12px]',
                        product.isActive
                            ? 'text-emerald-700'
                            : 'text-neutral-400',
                    )}
                >
                    <span
                        className={cn(
                            'size-1.5 rounded-full',
                            product.isActive
                                ? 'bg-emerald-600'
                                : 'bg-neutral-300',
                        )}
                    />
                    {product.isActive
                        ? t('products.active')
                        : t('products.inactive')}
                </span>
            </Td>

            <Td className="text-right">
                <button
                    type="button"
                    onClick={onDelete}
                    className="rounded px-1.5 py-0.5 text-[12px] text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                    {t('actions.delete')}
                </button>
            </Td>
        </Tr>
    );
}

/**
 * A number that reads as text until it is focused, then behaves as an input.
 * Enter or blur saves; Escape restores — an accidental click into the cell
 * should never be able to change a price.
 */
function QuickEditCell({
    value,
    display,
    label,
    onSave,
}: {
    value: number;
    display: string;
    label: string;
    onSave: (value: number) => void;
}) {
    const { t } = useTranslation('admin');
    const [draft, setDraft] = useState(String(value));
    const [isEditing, setIsEditing] = useState(false);
    const [lastSaved, setLastSaved] = useState(value);

    /*
     * The server is the source of truth: a saved row re-renders with the value
     * it actually stored, which may differ from what was typed. Adjusted
     * during render rather than in an effect, so the cell never paints the
     * stale number first.
     */
    if (lastSaved !== value) {
        setLastSaved(value);
        setDraft(String(value));
    }

    if (!isEditing) {
        return (
            <button
                type="button"
                aria-label={label}
                title={t('products.quickEdit.hint')}
                onClick={() => setIsEditing(true)}
                className="w-full rounded px-1 py-0.5 text-left tabular-nums transition-colors hover:bg-neutral-100"
            >
                {display}
            </button>
        );
    }

    const commit = () => {
        setIsEditing(false);

        const next = Number(draft);

        if (Number.isFinite(next) && next >= 0 && next !== value) {
            onSave(next);
        } else {
            setDraft(String(value));
        }
    };

    return (
        <input
            type="number"
            min={0}
            autoFocus
            aria-label={label}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    event.currentTarget.blur();
                }

                if (event.key === 'Escape') {
                    setDraft(String(value));
                    setIsEditing(false);
                }
            }}
            className="h-6 w-20 rounded border border-neutral-300 px-1 text-[13px] tabular-nums outline-none focus:border-neutral-900"
        />
    );
}

function saveQuickEdit(
    product: ProductRow,
    changes: { price_minor?: number; stock_quantity?: number },
): void {
    router.patch(
        quickUpdate(product.id).url,
        {
            price_minor: changes.price_minor ?? product.priceMinor,
            stock_quantity: changes.stock_quantity ?? product.stockQuantity,
        },
        { preserveScroll: true, preserveState: true },
    );
}

function applyFilters(filters: ProductFilters): void {
    router.get(
        index().url,
        {
            search: filters.search || undefined,
            category: filters.category ?? undefined,
            status: filters.status || undefined,
        },
        { preserveState: true, replace: true, preserveScroll: true },
    );
}

function runBulk(
    action: 'activate' | 'deactivate' | 'delete',
    ids: number[],
    clear: (ids: number[]) => void,
): void {
    router.patch(
        bulk().url,
        { action, ids },
        {
            preserveScroll: true,
            onSuccess: () => clear([]),
        },
    );
}
