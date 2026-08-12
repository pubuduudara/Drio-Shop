import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import type { MediaRecord } from '@/components/drio/media';
import { cn } from '@/lib/utils';
import media from '@/routes/admin/hero-slides/media';

/**
 * The image field of the hero slide form (§8).
 *
 * `primary` is a single-file collection on the model, so this is a single
 * drop target rather than the product form's gallery: a new upload replaces
 * whatever image is there.
 */
export function HeroSlideMedia({
    slideId,
    media: current,
}: {
    slideId: number;
    media: MediaRecord | null;
}) {
    const { t } = useTranslation('admin');

    const [isDropping, setIsDropping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(false);

    const upload = (files: FileList | File[]): void => {
        const [image] = Array.from(files);

        if (!image) {
            return;
        }

        setUploading(true);

        router.post(
            media.store(slideId).url,
            { image },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setUploading(false),
            },
        );
    };

    return (
        <div className="grid gap-3">
            {current && (
                <div className="relative w-full max-w-sm overflow-hidden rounded-md border border-neutral-200">
                    <img
                        src={current.url}
                        alt=""
                        loading="lazy"
                        className="aspect-[21/9] w-full object-cover"
                    />

                    <div className="flex justify-end p-1">
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmRemove(true)}
                        >
                            {t('heroSlides.media.remove')}
                        </Button>
                    </div>
                </div>
            )}

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
                        ? t('heroSlides.media.dropHere')
                        : t('heroSlides.media.description')}
                </p>

                <label className="mt-2 inline-flex cursor-pointer items-center rounded-md border border-neutral-200 px-2.5 py-1 text-[13px] hover:bg-neutral-50">
                    {t('heroSlides.media.upload')}
                    <input
                        type="file"
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

            <ConfirmDialog
                open={confirmRemove}
                onOpenChange={setConfirmRemove}
                name={t('heroSlides.media.title')}
                onConfirm={() => {
                    router.delete(media.destroy(slideId).url, {
                        preserveScroll: true,
                    });
                    setConfirmRemove(false);
                }}
            />
        </div>
    );
}
