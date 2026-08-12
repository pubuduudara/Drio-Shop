import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { HeroSlideForm } from '@/components/admin/hero-slide-form';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { destroy, index } from '@/routes/admin/hero-slides';
import type { HeroSlide } from '@/types/admin';

export default function HeroSlideEdit({ slide }: { slide: HeroSlide }) {
    const { t } = useTranslation('admin');
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <>
            <Head title={slide.resolvedHeadline} />

            <PageHeader
                title={t('heroSlides.editTitle')}
                description={slide.resolvedHeadline}
                actions={
                    <>
                        <Button size="sm" variant="ghost" asChild>
                            <Link href={index()}>{t('actions.back')}</Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setConfirmOpen(true)}
                        >
                            {t('actions.delete')}
                        </Button>
                    </>
                }
            />

            <HeroSlideForm slide={slide} />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                name={slide.resolvedHeadline}
                onConfirm={() => router.delete(destroy(slide.id).url)}
            />
        </>
    );
}
