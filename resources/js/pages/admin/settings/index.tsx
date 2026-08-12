import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminInput, FormSection } from '@/components/admin/form';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { update } from '@/routes/admin/settings';
import type { StoreSettings } from '@/types/admin';

/**
 * Store settings (§8).
 *
 * Currency is shown but not editable: changing it would reinterpret every
 * price already stored as minor units, which is a data migration rather than a
 * setting.
 */
export default function SettingsPage({
    settings,
    currency,
}: {
    settings: StoreSettings;
    currency: string;
}) {
    const { t } = useTranslation('admin');
    const form = useForm<StoreSettings>({ ...settings });
    const errors = form.errors as Record<string, string | undefined>;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put(update().url, { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('settings.title')} />

            <PageHeader
                title={t('settings.title')}
                description={t('settings.description')}
            />

            <form onSubmit={submit} className="grid max-w-2xl gap-4">
                <FormSection
                    title={t('settings.sections.shipping')}
                    description={t('settings.shippingHint', { currency })}
                >
                    <AdminInput
                        type="number"
                        min={0}
                        required
                        label={t('settings.fields.shippingFlatRate')}
                        value={form.data.shipping_flat_rate_minor}
                        error={errors.shipping_flat_rate_minor}
                        onChange={(event) =>
                            form.setData(
                                'shipping_flat_rate_minor',
                                Number(event.target.value),
                            )
                        }
                    />
                    <AdminInput
                        type="number"
                        min={0}
                        required
                        label={t('settings.fields.freeShippingThreshold')}
                        hint={t('settings.fields.freeShippingThresholdHint')}
                        value={form.data.free_shipping_threshold_minor}
                        error={errors.free_shipping_threshold_minor}
                        onChange={(event) =>
                            form.setData(
                                'free_shipping_threshold_minor',
                                Number(event.target.value),
                            )
                        }
                    />
                </FormSection>

                <FormSection title={t('settings.sections.contact')}>
                    <AdminInput
                        type="email"
                        required
                        label={t('settings.fields.contactEmail')}
                        value={form.data.contact_email}
                        error={errors.contact_email}
                        onChange={(event) =>
                            form.setData('contact_email', event.target.value)
                        }
                    />
                    <AdminInput
                        label={t('settings.fields.contactPhone')}
                        value={form.data.contact_phone}
                        error={errors.contact_phone}
                        onChange={(event) =>
                            form.setData('contact_phone', event.target.value)
                        }
                    />
                    <AdminInput
                        label={t('settings.fields.contactAddress')}
                        value={form.data.contact_address}
                        error={errors.contact_address}
                        onChange={(event) =>
                            form.setData('contact_address', event.target.value)
                        }
                    />
                </FormSection>

                <FormSection title={t('settings.sections.social')}>
                    <AdminInput
                        label={t('settings.fields.instagramHandle')}
                        value={form.data.instagram_handle}
                        error={errors.instagram_handle}
                        onChange={(event) =>
                            form.setData('instagram_handle', event.target.value)
                        }
                    />
                    <AdminInput
                        type="url"
                        label={t('settings.fields.instagramUrl')}
                        value={form.data.instagram_url}
                        error={errors.instagram_url}
                        onChange={(event) =>
                            form.setData('instagram_url', event.target.value)
                        }
                    />
                    <AdminInput
                        type="url"
                        label={t('settings.fields.facebookUrl')}
                        value={form.data.facebook_url}
                        error={errors.facebook_url}
                        onChange={(event) =>
                            form.setData('facebook_url', event.target.value)
                        }
                    />
                    <AdminInput
                        type="url"
                        label={t('settings.fields.youtubeUrl')}
                        value={form.data.youtube_url}
                        error={errors.youtube_url}
                        onChange={(event) =>
                            form.setData('youtube_url', event.target.value)
                        }
                    />
                </FormSection>

                <div>
                    <Button type="submit" size="sm" disabled={form.processing}>
                        {t('actions.save')}
                    </Button>
                </div>
            </form>
        </>
    );
}
