import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import media from '@/routes/admin/products/media';
import type { AdminMedia } from '@/types/admin';

/**
 * The Media tab of the product form (§8): drag-drop upload, reorder, set
 * primary.
 *
 * Reordering is available by drag and by button, because a drag-only control
 * is unreachable from a keyboard and the console has to be navigable end to
 * end (§11). The arrangement is staged locally and saved in one request, so
 * moving three tiles is one write rather than three.
 */
export function ProductMedia({
    productId,
    gallery,
    primaryMediaId,
}: {
    productId: number;
    gallery: AdminMedia[];
    /** The gallery row the single-file `primary` collection was copied from. */
    primaryMediaId: number | null;
}) {
    const { t } = useTranslation('admin');

    const serverPrimaryId = primaryMediaId;

    const [order, setOrder] = useState<AdminMedia[]>(gallery);
    const [primaryId, setPrimaryId] = useState<number | null>(serverPrimaryId);
    const [isDropping, setIsDropping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<AdminMedia | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    /*
     * A completed upload, delete or save re-renders this page with new media;
     * the staged arrangement follows the server rather than the other way
     * round. Adjusted during render rather than in an effect, so the tiles
     * never paint the previous arrangement first.
     */
    const [lastGallery, setLastGallery] = useState(gallery);

    if (lastGallery !== gallery) {
        setLastGallery(gallery);
        setOrder(gallery);
        setPrimaryId(serverPrimaryId);
    }

    const isDirty =
        order.some((item, index) => item.id !== gallery[index]?.id) ||
        primaryId !== serverPrimaryId;

    const upload = (files: FileList | File[]): void => {
        const images = Array.from(files);

        if (images.length === 0) {
            return;
        }

        setUploading(true);

        router.post(
            media.store(productId).url,
            { images },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setUploading(false),
            },
        );
    };

    const move = (from: number, to: number): void => {
        if (to < 0 || to >= order.length) {
            return;
        }

        const next = [...order];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        setOrder(next);
    };

    const saveArrangement = (): void => {
        router.patch(
            media.update(productId).url,
            {
                order: order.map((item) => item.id),
                primary_id: primaryId,
            },
            { preserveScroll: true },
        );
    };

    return (
        <div className="grid gap-3">
            <div
                onDragOver={(event: DragEvent<HTMLDivElement>) => {
                    event.preventDefault();
                    setIsDropping(true);
                }}
                onDragLeave={() => setIsDropping(false)}
                onDrop={(event: DragEvent<HTMLDivElement>) => {
                    event.preventDefault();
                    setIsDropping(false);
                    upload(event.dataTransfer.files);
                }}
                className={cn(
                    'rounded-md border border-dashed px-4 py-6 text-center transition-colors',
                    isDropping
                        ? 'border-neutral-900 bg-neutral-50'
                        : 'border-neutral-300',
                )}
            >
                <p className="text-neutral-600">
                    {isDropping
                        ? t('products.media.dropHere')
                        : t('products.media.description')}
                </p>

                <label className="mt-2 inline-flex cursor-pointer items-center rounded-md border border-neutral-200 px-2.5 py-1 text-[13px] hover:bg-neutral-50">
                    {t('actions.upload')}
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        disabled={uploading}
                        onChange={(event) => {
                            if (event.target.files) {
                                upload(event.target.files);
                            }

                            event.target.value = '';
                        }}
                    />
                </label>
            </div>

            {order.length === 0 ? (
                <p className="text-neutral-500">{t('products.media.empty')}</p>
            ) : (
                <>
                    <p className="text-[11px] text-neutral-500">
                        {t('products.media.reorderHint')}
                    </p>

                    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {order.map((item, index) => (
                            <li
                                key={item.id}
                                draggable
                                onDragStart={() => setDragIndex(index)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => {
                                    if (dragIndex !== null) {
                                        move(dragIndex, index);
                                    }

                                    setDragIndex(null);
                                }}
                                className={cn(
                                    'relative overflow-hidden rounded-md border',
                                    item.id === primaryId
                                        ? 'border-neutral-900'
                                        : 'border-neutral-200',
                                )}
                            >
                                <img
                                    src={item.url}
                                    alt=""
                                    loading="lazy"
                                    className="aspect-square w-full object-cover"
                                />

                                {item.id === primaryId && (
                                    <span className="absolute top-1 left-1 rounded bg-neutral-900 px-1.5 py-px text-[10px] font-medium text-white">
                                        {t('products.media.primary')}
                                    </span>
                                )}

                                <div className="flex items-center justify-between gap-1 p-1">
                                    <div className="flex items-center gap-0.5">
                                        <TileButton
                                            label={t('products.media.moveLeft')}
                                            onClick={() =>
                                                move(index, index - 1)
                                            }
                                            disabled={index === 0}
                                        >
                                            ←
                                        </TileButton>
                                        <TileButton
                                            label={t(
                                                'products.media.moveRight',
                                            )}
                                            onClick={() =>
                                                move(index, index + 1)
                                            }
                                            disabled={
                                                index === order.length - 1
                                            }
                                        >
                                            →
                                        </TileButton>
                                    </div>

                                    <div className="flex items-center gap-0.5">
                                        <TileButton
                                            label={t(
                                                'products.media.setPrimary',
                                            )}
                                            onClick={() =>
                                                setPrimaryId(item.id)
                                            }
                                            disabled={item.id === primaryId}
                                        >
                                            ★
                                        </TileButton>
                                        <TileButton
                                            label={t('products.media.remove')}
                                            onClick={() =>
                                                setPendingDelete(item)
                                            }
                                        >
                                            ✕
                                        </TileButton>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div>
                        <Button
                            type="button"
                            size="sm"
                            disabled={!isDirty}
                            onClick={saveArrangement}
                        >
                            {t('actions.saveOrder')}
                        </Button>
                    </div>
                </>
            )}

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                name={pendingDelete?.name ?? ''}
                onConfirm={() => {
                    if (pendingDelete) {
                        router.delete(
                            media.destroy([productId, pendingDelete.id]).url,
                            { preserveScroll: true },
                        );
                    }

                    setPendingDelete(null);
                }}
            />
        </div>
    );
}

function TileButton({
    label,
    onClick,
    disabled,
    children,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    children: string;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={onClick}
            disabled={disabled}
            className="rounded px-1.5 py-0.5 text-[12px] text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-30"
        >
            {children}
        </button>
    );
}
