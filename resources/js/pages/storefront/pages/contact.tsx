import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/drio/button';
import { Input, Textarea } from '@/components/drio/field';
import { InstagramIcon } from '@/components/drio/icons/social';
import { StorefrontPageHeader } from '@/components/storefront/page-header';
import { home } from '@/routes';
import { store } from '@/routes/contact';

/**
 * Contact (§7.12).
 *
 * Field errors come from the server, because that is where the rule that
 * produced them lives, and they say what to fix rather than apologising. The
 * success line comes from the client dictionary — it is interface copy, and
 * §9.3 puts interface copy in the dictionaries. Same split as the newsletter.
 */
export default function Contact({
    contact,
}: {
    contact: {
        email: string;
        phone: string;
        address: string;
        instagram: string;
    };
}) {
    const { t } = useTranslation(['pages', 'nav']);
    const [hasSent, setHasSent] = useState(false);

    const form = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setHasSent(true);
            },
            onError: () => setHasSent(false),
        });
    };

    return (
        <>
            <Head title={t('pages:contact.title')} />

            <StorefrontPageHeader
                eyebrow={t('pages:contact.eyebrow')}
                title={t('pages:contact.title')}
                description={t('pages:contact.description')}
                crumbs={[
                    { label: t('nav:primary.home'), href: home().url },
                    { label: t('nav:primary.contact') },
                ]}
            />

            <div className="mx-auto grid max-w-drio gap-10 px-5 py-16 md:px-8 md:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-10">
                <section aria-labelledby="reach-us">
                    <h2
                        id="reach-us"
                        className="font-display text-2xl font-medium text-ink"
                    >
                        {t('pages:contact.details.title')}
                    </h2>

                    <dl className="mt-5 flex flex-col gap-4 border-t border-hairline pt-5">
                        {contact.email && (
                            <Detail label={t('pages:contact.details.email')}>
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="text-ink transition-colors hover:text-gold-700"
                                >
                                    {contact.email}
                                </a>
                            </Detail>
                        )}

                        {contact.phone && (
                            <Detail label={t('pages:contact.details.phone')}>
                                <a
                                    href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
                                    className="text-ink transition-colors hover:text-gold-700"
                                >
                                    {contact.phone}
                                </a>
                            </Detail>
                        )}

                        {contact.address && (
                            <Detail label={t('pages:contact.details.address')}>
                                <span className="text-ink">
                                    {contact.address}
                                </span>
                            </Detail>
                        )}

                        {contact.instagram && (
                            <Detail
                                label={t('pages:contact.details.instagram')}
                            >
                                <span className="inline-flex items-center gap-2 text-ink">
                                    <InstagramIcon
                                        width={16}
                                        height={16}
                                        className="text-gold"
                                        aria-hidden
                                    />
                                    {contact.instagram}
                                </span>
                            </Detail>
                        )}
                    </dl>

                    <p className="mt-6 text-small text-ink-muted">
                        {t('pages:contact.details.hours')}
                    </p>
                </section>

                <section aria-labelledby="send-a-message">
                    <h2
                        id="send-a-message"
                        className="font-display text-2xl font-medium text-ink"
                    >
                        {t('pages:contact.form.title')}
                    </h2>

                    <form
                        onSubmit={onSubmit}
                        noValidate
                        className="mt-5 grid gap-4 border-t border-hairline pt-5"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input
                                label={t('pages:contact.form.name')}
                                autoComplete="name"
                                required
                                value={form.data.name}
                                error={form.errors.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                            <Input
                                type="email"
                                label={t('pages:contact.form.email')}
                                autoComplete="email"
                                required
                                value={form.data.email}
                                error={form.errors.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                            />
                        </div>

                        <Input
                            label={t('pages:contact.form.subject')}
                            required
                            value={form.data.subject}
                            error={form.errors.subject}
                            onChange={(event) =>
                                form.setData('subject', event.target.value)
                            }
                        />

                        <Textarea
                            rows={6}
                            label={t('pages:contact.form.message')}
                            placeholder={t(
                                'pages:contact.form.messagePlaceholder',
                            )}
                            required
                            value={form.data.message}
                            error={form.errors.message}
                            onChange={(event) =>
                                form.setData('message', event.target.value)
                            }
                        />

                        <div className="flex flex-wrap items-center gap-4">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={form.processing}
                            >
                                {form.processing
                                    ? t('pages:contact.form.sending')
                                    : t('pages:contact.form.submit')}
                            </Button>

                            {/* Announced politely so the outcome reaches a
                                screen reader without interrupting (§11). */}
                            <p aria-live="polite" className="text-small">
                                {hasSent && (
                                    <span className="text-forest-500">
                                        {t('pages:contact.form.success')}
                                    </span>
                                )}
                            </p>
                        </div>
                    </form>
                </section>
            </div>
        </>
    );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <dt className="drio-eyebrow text-ink-muted">{label}</dt>
            <dd className="text-copy">{children}</dd>
        </div>
    );
}
