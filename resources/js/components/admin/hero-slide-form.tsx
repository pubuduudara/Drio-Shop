import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminInput, AdminToggle, FormSection } from '@/components/admin/form';
import { HeroSlideMedia } from '@/components/admin/hero-slide-media';
import { TranslatableField } from '@/components/admin/translatable-field';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import { index, store, update } from '@/routes/admin/hero-slides';
import type { HeroSlide, Translations } from '@/types/admin';

/**
 * The hero slide create/edit form (§8).
 *
 * Headline and subhead go through `<TranslatableField />` like every other
 * translatable field (§9.5). The CTA hrefs beside the labels do not translate
 * — they are routes, not copy (§6).
 */

type Payload = {
    headline: Translations;
    subhead: Translations;
    primary_cta_label: Translations;
    secondary_cta_label: Translations;
    primary_cta_href: string;
    secondary_cta_href: string;
    sort_order: number;
    is_active: boolean;
};

export function HeroSlideForm({
    slide,
    nextSortOrder = 0,
}: {
    slide?: HeroSlide;
    nextSortOrder?: number;
}) {
    const { t } = useTranslation('admin');
    const { enabledLocales } = useLocale();

    const empty = (): Translations =>
        Object.fromEntries(enabledLocales.map((locale) => [locale, '']));

    const form = useForm<Payload>({
        headline: slide?.headline ?? empty(),
        subhead: slide?.subhead ?? empty(),
        primary_cta_label: slide?.primaryCtaLabel ?? empty(),
        secondary_cta_label: slide?.secondaryCtaLabel ?? empty(),
        primary_cta_href: slide?.primaryCtaHref ?? '',
        secondary_cta_href: slide?.secondaryCtaHref ?? '',
        sort_order: slide?.sortOrder ?? nextSortOrder,
        is_active: slide?.isActive ?? true,
    });

    const errors = form.errors as Record<string, string | undefined>;

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (slide) {
            form.put(update(slide.id).url, { preserveScroll: true });
        } else {
            form.post(store().url);
        }
    };

    return (
        <form onSubmit={submit} className="grid max-w-2xl gap-4">
            <FormSection
                title={t('heroSlides.media.title')}
                description={
                    slide ? undefined : t('heroSlides.media.saveOnlyOnExisting')
                }
            >
                {slide ? (
                    <HeroSlideMedia slideId={slide.id} media={slide.media} />
                ) : null}
            </FormSection>

            <FormSection title={t('heroSlides.sections.copy')}>
                <TranslatableField
                    name="headline"
                    label={t('heroSlides.fields.headline')}
                    hint={t('heroSlides.fields.headlineHint')}
                    as="textarea"
                    rows={3}
                    value={form.data.headline}
                    onChange={(value) => form.setData('headline', value)}
                    errors={errors}
                    required
                />

                <TranslatableField
                    name="subhead"
                    label={t('heroSlides.fields.subhead')}
                    as="textarea"
                    rows={2}
                    value={form.data.subhead}
                    onChange={(value) => form.setData('subhead', value)}
                    errors={errors}
                />
            </FormSection>

            <FormSection
                title={t('heroSlides.sections.actions')}
                description={t('heroSlides.fields.hrefHint')}
            >
                <TranslatableField
                    name="primary_cta_label"
                    label={t('heroSlides.fields.primaryCtaLabel')}
                    value={form.data.primary_cta_label}
                    onChange={(value) =>
                        form.setData('primary_cta_label', value)
                    }
                    errors={errors}
                />
                <AdminInput
                    label={t('heroSlides.fields.primaryCtaHref')}
                    placeholder="/shop"
                    value={form.data.primary_cta_href}
                    error={errors.primary_cta_href}
                    onChange={(event) =>
                        form.setData('primary_cta_href', event.target.value)
                    }
                />

                <TranslatableField
                    name="secondary_cta_label"
                    label={t('heroSlides.fields.secondaryCtaLabel')}
                    value={form.data.secondary_cta_label}
                    onChange={(value) =>
                        form.setData('secondary_cta_label', value)
                    }
                    errors={errors}
                />
                <AdminInput
                    label={t('heroSlides.fields.secondaryCtaHref')}
                    placeholder="/about"
                    value={form.data.secondary_cta_href}
                    error={errors.secondary_cta_href}
                    onChange={(event) =>
                        form.setData('secondary_cta_href', event.target.value)
                    }
                />
            </FormSection>

            <FormSection title={t('heroSlides.sections.display')}>
                <AdminToggle
                    label={t('heroSlides.fields.isActive')}
                    description={t('heroSlides.fields.isActiveHint')}
                    checked={form.data.is_active}
                    onChange={(checked) => form.setData('is_active', checked)}
                />

                <AdminInput
                    type="number"
                    min={0}
                    label={t('heroSlides.fields.sortOrder')}
                    value={form.data.sort_order}
                    error={errors.sort_order}
                    onChange={(event) =>
                        form.setData('sort_order', Number(event.target.value))
                    }
                />
            </FormSection>

            <div className="flex items-center gap-2">
                <Button type="submit" size="sm" disabled={form.processing}>
                    {t('actions.save')}
                </Button>
                <Button type="button" size="sm" variant="ghost" asChild>
                    <Link href={index()}>{t('actions.cancel')}</Link>
                </Button>
            </div>
        </form>
    );
}
