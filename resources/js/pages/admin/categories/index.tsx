import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyRow, TableShell, Td, Th, Tr } from '@/components/admin/table';
import { CategoryIcon } from '@/components/drio/icons/category';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { create, destroy, edit, reorder } from '@/routes/admin/categories';
import type { CategoryRow } from '@/types/admin';

/**
 * The categories list (§8).
 *
 * Order is staged locally and saved in one request. Rows can be dragged or
 * moved with buttons — a drag-only reorder is unusable from a keyboard, and
 * the console has to be navigable end to end (§11).
 */
export default function CategoriesIndex({
    categories,
}: {
    categories: CategoryRow[];
}) {
    const { t } = useTranslation('admin');

    const [order, setOrder] = useState(categories);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [pendingDelete, setPendingDelete] = useState<CategoryRow | null>(
        null,
    );

    /*
     * A saved reorder re-renders this page with the server's order; the staged
     * list follows it rather than the other way round. Adjusted during render
     * rather than in an effect, so the table never paints the stale order.
     */
    const [lastServerOrder, setLastServerOrder] = useState(categories);

    if (lastServerOrder !== categories) {
        setLastServerOrder(categories);
        setOrder(categories);
    }

    const isDirty = order.some(
        (category, index) => category.id !== categories[index]?.id,
    );

    const move = (from: number, to: number): void => {
        if (to < 0 || to >= order.length) {
            return;
        }

        const next = [...order];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        setOrder(next);
    };

    return (
        <>
            <Head title={t('categories.title')} />

            <PageHeader
                title={t('categories.title')}
                description={t('categories.reorderHint')}
                actions={
                    <>
                        {isDirty && (
                            <Button
                                size="sm"
                                onClick={() =>
                                    router.patch(
                                        reorder().url,
                                        {
                                            ids: order.map(
                                                (category) => category.id,
                                            ),
                                        },
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                {t('actions.saveOrder')}
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant={isDirty ? 'outline' : 'default'}
                            asChild
                        >
                            <Link href={create()}>
                                {t('categories.create')}
                            </Link>
                        </Button>
                    </>
                }
            />

            <TableShell>
                <thead>
                    <tr>
                        <Th className="w-20">
                            {t('categories.columns.order')}
                        </Th>
                        <Th className="w-12">
                            <span className="sr-only">
                                {t('categories.columns.icon')}
                            </span>
                        </Th>
                        <Th>{t('categories.columns.name')}</Th>
                        <Th className="hidden md:table-cell">
                            {t('categories.columns.slug')}
                        </Th>
                        <Th className="w-24">
                            {t('categories.columns.products')}
                        </Th>
                        <Th className="w-28">
                            {t('categories.columns.featured')}
                        </Th>
                        <Th className="w-32 text-right">
                            {t('categories.columns.actions')}
                        </Th>
                    </tr>
                </thead>

                <tbody>
                    {order.length === 0 && (
                        <EmptyRow colSpan={7}>{t('categories.empty')}</EmptyRow>
                    )}

                    {order.map((category, index) => (
                        <Tr
                            key={category.id}
                            draggable
                            onDragStart={() => setDragIndex(index)}
                            onDragOver={(
                                event: DragEvent<HTMLTableRowElement>,
                            ) => event.preventDefault()}
                            onDrop={() => {
                                if (dragIndex !== null) {
                                    move(dragIndex, index);
                                }

                                setDragIndex(null);
                            }}
                        >
                            <Td>
                                <div
                                    className="flex items-center gap-0.5"
                                    aria-label={t('categories.dragHandle', {
                                        name: category.name,
                                    })}
                                >
                                    <MoveButton
                                        label={t('categories.moveUp')}
                                        disabled={index === 0}
                                        onClick={() => move(index, index - 1)}
                                    >
                                        ↑
                                    </MoveButton>
                                    <MoveButton
                                        label={t('categories.moveDown')}
                                        disabled={index === order.length - 1}
                                        onClick={() => move(index, index + 1)}
                                    >
                                        ↓
                                    </MoveButton>
                                </div>
                            </Td>

                            <Td>
                                <CategoryIcon
                                    iconKey={category.iconKey}
                                    width={18}
                                    height={18}
                                    className="text-forest"
                                />
                            </Td>

                            <Td>
                                <Link
                                    href={edit(category.id)}
                                    className="font-medium text-neutral-900 hover:underline"
                                >
                                    {category.name}
                                </Link>
                            </Td>

                            <Td className="hidden font-mono text-[12px] text-neutral-500 md:table-cell">
                                {category.slug}
                            </Td>

                            <Td className="text-neutral-600 tabular-nums">
                                {category.productsCount}
                            </Td>

                            <Td>
                                <span
                                    className={cn(
                                        'text-[12px]',
                                        category.isFeatured
                                            ? 'text-emerald-700'
                                            : 'text-neutral-400',
                                    )}
                                >
                                    {category.isFeatured
                                        ? t('categories.featured')
                                        : t('categories.notFeatured')}
                                </span>
                            </Td>

                            <Td className="text-right">
                                <button
                                    type="button"
                                    disabled={category.productsCount > 0}
                                    title={
                                        category.productsCount > 0
                                            ? t('categories.deleteBlocked')
                                            : undefined
                                    }
                                    onClick={() => setPendingDelete(category)}
                                    className="rounded px-1.5 py-0.5 text-[12px] text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:pointer-events-none disabled:opacity-40"
                                >
                                    {t('actions.delete')}
                                </button>
                            </Td>
                        </Tr>
                    ))}
                </tbody>
            </TableShell>

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                name={pendingDelete?.name ?? ''}
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

function MoveButton({
    label,
    disabled,
    onClick,
    children,
}: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    children: string;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
            className="rounded px-1.5 py-0.5 text-[12px] text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-25"
        >
            {children}
        </button>
    );
}
