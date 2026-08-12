import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyRow, TableShell, Td, Th, Tr } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { create, destroy, edit, reorder } from '@/routes/admin/hero-slides';
import type { HeroSlide } from '@/types/admin';

/**
 * The hero slides list (§8): reorder and an active toggle.
 *
 * Order is staged locally and saved in one request, and rows move by drag or
 * by button — the same pattern as categories, for the same keyboard reason
 * (§11).
 */
export default function HeroSlidesIndex({ slides }: { slides: HeroSlide[] }) {
    const { t } = useTranslation('admin');

    const [order, setOrder] = useState(slides);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [pendingDelete, setPendingDelete] = useState<HeroSlide | null>(null);

    /* Adjusted during render rather than in an effect, for the reason
       documented on the categories list. */
    const [lastServerOrder, setLastServerOrder] = useState(slides);

    if (lastServerOrder !== slides) {
        setLastServerOrder(slides);
        setOrder(slides);
    }

    const isDirty = order.some(
        (slide, index) => slide.id !== slides[index]?.id,
    );

    const move = (from: number, to: number): void => {
        if (to < 0 || to >= order.length) {
            return;
        }

        const next = [...order];
        const [slide] = next.splice(from, 1);
        next.splice(to, 0, slide);
        setOrder(next);
    };

    return (
        <>
            <Head title={t('heroSlides.title')} />

            <PageHeader
                title={t('heroSlides.title')}
                description={t('heroSlides.description')}
                actions={
                    <>
                        {isDirty && (
                            <Button
                                size="sm"
                                onClick={() =>
                                    router.patch(
                                        reorder().url,
                                        { ids: order.map((slide) => slide.id) },
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
                                {t('heroSlides.create')}
                            </Link>
                        </Button>
                    </>
                }
            />

            <TableShell>
                <thead>
                    <tr>
                        <Th className="w-20">
                            {t('heroSlides.columns.order')}
                        </Th>
                        <Th>{t('heroSlides.columns.headline')}</Th>
                        <Th className="hidden w-40 md:table-cell">
                            {t('heroSlides.columns.cta')}
                        </Th>
                        <Th className="w-24">
                            {t('heroSlides.columns.status')}
                        </Th>
                        <Th className="w-24 text-right">
                            {t('heroSlides.columns.actions')}
                        </Th>
                    </tr>
                </thead>

                <tbody>
                    {order.length === 0 && (
                        <EmptyRow colSpan={5}>{t('heroSlides.empty')}</EmptyRow>
                    )}

                    {order.map((slide, index) => (
                        <Tr
                            key={slide.id}
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
                                <div className="flex items-center gap-0.5">
                                    <MoveButton
                                        label={t('heroSlides.moveUp')}
                                        disabled={index === 0}
                                        onClick={() => move(index, index - 1)}
                                    >
                                        ↑
                                    </MoveButton>
                                    <MoveButton
                                        label={t('heroSlides.moveDown')}
                                        disabled={index === order.length - 1}
                                        onClick={() => move(index, index + 1)}
                                    >
                                        ↓
                                    </MoveButton>
                                </div>
                            </Td>

                            <Td>
                                <Link
                                    href={edit(slide.id)}
                                    className="font-medium whitespace-pre-line text-neutral-900 hover:underline"
                                >
                                    {slide.resolvedHeadline}
                                </Link>
                            </Td>

                            <Td className="hidden font-mono text-[11px] text-neutral-500 md:table-cell">
                                {slide.primaryCtaHref ?? '—'}
                            </Td>

                            <Td>
                                <span
                                    className={cn(
                                        'text-[12px]',
                                        slide.isActive
                                            ? 'text-emerald-700'
                                            : 'text-neutral-400',
                                    )}
                                >
                                    {slide.isActive
                                        ? t('heroSlides.active')
                                        : t('heroSlides.inactive')}
                                </span>
                            </Td>

                            <Td className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setPendingDelete(slide)}
                                    className="rounded px-1.5 py-0.5 text-[12px] text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-700"
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
                name={pendingDelete?.resolvedHeadline ?? ''}
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
