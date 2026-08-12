import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/drio/button';
import {
    NewsletterCoconut,
    NewsletterSprig,
} from '@/components/drio/icons/botanical';
import { subscribe } from '@/routes';

/**
 * Newsletter (§7.10).
 *
 * Posts to a real endpoint and shows inline success and error states in the
 * interface voice — the error says what to fix rather than apologising.
 *
 * The success line comes from the client dictionary rather than a server flash:
 * it is interface copy, and §9.3 puts interface copy in the dictionaries. Field
 * errors still come from the server, because that is where the rule that
 * produced them lives.
 */
export function Newsletter() {
    const { t } = useTranslation(['home', 'common']);
    const [hasSubscribed, setHasSubscribed] = useState(false);

    const form = useForm({ email: '' });

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        form.post(subscribe().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('email');
                setHasSubscribed(true);
            },
            onError: () => setHasSubscribed(false),
        });
    };

    return (
        <section className="relative overflow-hidden bg-band">
            {/* Drawn botanicals anchored to the far edges, hidden below lg so
                they never crowd the form on narrow viewports (§7.10). */}
            <NewsletterSprig
                className="pointer-events-none absolute bottom-0 left-0 hidden h-full max-h-52 text-forest-500/50 lg:block"
                aria-hidden
            />
            <NewsletterCoconut
                className="pointer-events-none absolute right-0 bottom-0 hidden h-full max-h-52 text-clay/45 lg:block"
                aria-hidden
            />

            <div className="relative mx-auto max-w-drio px-5 py-14 md:px-8 md:py-16 lg:px-10">
                <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 lg:flex-row lg:justify-between">
                    <div className="text-center lg:max-w-sm lg:text-left">
                        <h2 className="font-display text-section font-medium text-ink">
                            {t('newsletter.title')}
                        </h2>
                        <p className="mt-2 text-small text-ink-muted">
                            {t('newsletter.subhead')}
                        </p>
                    </div>

                    <div className="w-full lg:max-w-md">
                        <form
                            onSubmit={onSubmit}
                            noValidate
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <div className="flex-1">
                                <label
                                    htmlFor="newsletter-email"
                                    className="sr-only"
                                >
                                    {t('newsletter.emailLabel')}
                                </label>
                                <input
                                    id="newsletter-email"
                                    type="email"
                                    name="email"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    placeholder={t(
                                        'newsletter.emailPlaceholder',
                                    )}
                                    aria-invalid={Boolean(form.errors.email)}
                                    aria-describedby={
                                        form.errors.email
                                            ? 'newsletter-email-error'
                                            : undefined
                                    }
                                    className="h-11 w-full rounded-btn border border-line bg-paper px-3.5 text-copy text-ink transition-colors placeholder:text-ink-muted focus:border-gold aria-[invalid=true]:border-chilli"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={form.processing}
                            >
                                {t('common:actions.subscribe')}
                            </Button>
                        </form>

                        {/* Announced politely so the outcome reaches a screen
                            reader without interrupting (§11). */}
                        <div aria-live="polite" className="mt-2 min-h-5">
                            {form.errors.email && (
                                <p
                                    id="newsletter-email-error"
                                    className="text-center text-small text-chilli sm:text-left"
                                >
                                    {form.errors.email}
                                </p>
                            )}
                            {!form.errors.email && hasSubscribed && (
                                <p className="text-center text-small text-forest-500 sm:text-left">
                                    {t('newsletter.success')}
                                </p>
                            )}
                        </div>

                        <p className="mt-1 text-center text-small text-ink-muted">
                            {t('newsletter.privacy')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
