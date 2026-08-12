import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/drio/button';
import { Input, Select, Textarea } from '@/components/drio/field';
import { CheckIcon } from '@/components/drio/icons/ui';
import { Media } from '@/components/drio/media';
import { Price } from '@/components/drio/price';
import { OrderSummary } from '@/components/storefront/order-summary';
import { StorefrontPageHeader } from '@/components/storefront/page-header';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { index as cartIndex } from '@/routes/cart';
import { store } from '@/routes/checkout';

/**
 * Checkout (§7.12): contact → Japanese-format shipping address → payment
 * method stub → review.
 *
 * The steps are a front-end concern and the whole form posts once at the end,
 * so moving between Contact and Shipping costs nothing and there is no
 * half-created order if someone closes the tab on step three.
 *
 * A submission that comes back with errors reopens the earliest step that owns
 * one — a validation message on a step you cannot see is a dead end.
 */

const STEPS = ['contact', 'shipping', 'payment', 'review'] as const;

type Step = (typeof STEPS)[number];

/** Which step owns which field, so a failed submit can reopen the right one. */
const STEP_FIELDS: Record<Step, string[]> = {
    contact: ['customer_name', 'customer_email', 'customer_phone'],
    shipping: [
        'postal_code',
        'prefecture',
        'city',
        'address_line1',
        'address_line2',
    ],
    payment: ['payment_method'],
    review: ['notes'],
};

type Payload = {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    postal_code: string;
    prefecture: string;
    city: string;
    address_line1: string;
    address_line2: string;
    payment_method: string;
    notes: string;
};

export default function Checkout({
    prefectures,
    paymentMethods,
}: {
    prefectures: string[];
    paymentMethods: string[];
}) {
    const { t } = useTranslation(['checkout', 'cart', 'nav']);
    const { lines, totals } = useCart();
    const [step, setStep] = useState<Step>('contact');

    const form = useForm<Payload>({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        postal_code: '',
        prefecture: '',
        city: '',
        address_line1: '',
        address_line2: '',
        payment_method: paymentMethods[0] ?? 'card',
        notes: '',
    });

    const errors = form.errors as Record<string, string | undefined>;
    const stepIndex = STEPS.indexOf(step);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post(store().url, {
            onError: (failures) => {
                const firstBrokenStep = STEPS.find((candidate) =>
                    STEP_FIELDS[candidate].some((field) => field in failures),
                );

                if (firstBrokenStep) {
                    setStep(firstBrokenStep);
                }
            },
        });
    };

    return (
        <>
            <Head title={t('checkout:title')} />

            <StorefrontPageHeader
                eyebrow={t('checkout:eyebrow')}
                title={t('checkout:title')}
                crumbs={[
                    { label: t('nav:primary.home'), href: home().url },
                    { label: t('cart:title'), href: cartIndex().url },
                    { label: t('checkout:title') },
                ]}
            />

            <div className="mx-auto max-w-drio px-5 py-10 md:px-8 md:py-12 lg:px-10">
                <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
                    <form onSubmit={submit} noValidate>
                        <StepNav
                            active={step}
                            onSelect={setStep}
                            errors={errors}
                        />

                        <div className="mt-8">
                            {step === 'contact' && (
                                <Fieldset title={t('checkout:contact.title')}>
                                    <Input
                                        label={t('checkout:contact.name')}
                                        autoComplete="name"
                                        required
                                        value={form.data.customer_name}
                                        error={errors.customer_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'customer_name',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <Input
                                        type="email"
                                        label={t('checkout:contact.email')}
                                        hint={t('checkout:contact.emailHint')}
                                        autoComplete="email"
                                        required
                                        value={form.data.customer_email}
                                        error={errors.customer_email}
                                        onChange={(event) =>
                                            form.setData(
                                                'customer_email',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <Input
                                        type="tel"
                                        label={t('checkout:contact.phone')}
                                        hint={t('checkout:contact.phoneHint')}
                                        autoComplete="tel"
                                        value={form.data.customer_phone}
                                        error={errors.customer_phone}
                                        onChange={(event) =>
                                            form.setData(
                                                'customer_phone',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Fieldset>
                            )}

                            {step === 'shipping' && (
                                <Fieldset title={t('checkout:shipping.title')}>
                                    <Input
                                        label={t(
                                            'checkout:shipping.postalCode',
                                        )}
                                        hint={t(
                                            'checkout:shipping.postalCodeHint',
                                        )}
                                        autoComplete="postal-code"
                                        inputMode="numeric"
                                        required
                                        className="sm:max-w-48"
                                        value={form.data.postal_code}
                                        error={errors.postal_code}
                                        onChange={(event) =>
                                            form.setData(
                                                'postal_code',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <Select
                                        label={t(
                                            'checkout:shipping.prefecture',
                                        )}
                                        placeholder={t(
                                            'checkout:shipping.prefecturePlaceholder',
                                        )}
                                        required
                                        className="sm:max-w-72"
                                        value={form.data.prefecture}
                                        error={errors.prefecture}
                                        options={prefectures.map(
                                            (prefecture) => ({
                                                value: prefecture,
                                                label: prefecture,
                                            }),
                                        )}
                                        onChange={(event) =>
                                            form.setData(
                                                'prefecture',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <Input
                                        label={t('checkout:shipping.city')}
                                        autoComplete="address-level2"
                                        required
                                        value={form.data.city}
                                        error={errors.city}
                                        onChange={(event) =>
                                            form.setData(
                                                'city',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <Input
                                        label={t(
                                            'checkout:shipping.addressLine1',
                                        )}
                                        autoComplete="address-line1"
                                        required
                                        value={form.data.address_line1}
                                        error={errors.address_line1}
                                        onChange={(event) =>
                                            form.setData(
                                                'address_line1',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <Input
                                        label={t(
                                            'checkout:shipping.addressLine2',
                                        )}
                                        hint={t(
                                            'checkout:shipping.addressLine2Hint',
                                        )}
                                        autoComplete="address-line2"
                                        value={form.data.address_line2}
                                        error={errors.address_line2}
                                        onChange={(event) =>
                                            form.setData(
                                                'address_line2',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Fieldset>
                            )}

                            {step === 'payment' && (
                                <Fieldset title={t('checkout:payment.title')}>
                                    <p className="rounded-card border border-gold-200 bg-gold-200/20 px-4 py-3 text-small text-ink">
                                        {t('checkout:payment.note')}
                                    </p>

                                    <fieldset className="grid gap-2">
                                        <legend className="sr-only">
                                            {t('checkout:payment.title')}
                                        </legend>

                                        {paymentMethods.map((method) => (
                                            <label
                                                key={method}
                                                className={cn(
                                                    'flex cursor-pointer items-start gap-3 rounded-card border px-4 py-3 transition-colors',
                                                    form.data.payment_method ===
                                                        method
                                                        ? 'border-gold bg-gold-200/15'
                                                        : 'border-hairline hover:border-ink/25',
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value={method}
                                                    checked={
                                                        form.data
                                                            .payment_method ===
                                                        method
                                                    }
                                                    onChange={() =>
                                                        form.setData(
                                                            'payment_method',
                                                            method,
                                                        )
                                                    }
                                                    className="mt-1 accent-[var(--drio-gold)]"
                                                />
                                                <span className="flex flex-col gap-0.5">
                                                    <span className="text-copy text-ink">
                                                        {t(
                                                            `checkout:payment.methods.${method}`,
                                                        )}
                                                    </span>
                                                    <span className="text-small text-ink-muted">
                                                        {t(
                                                            `checkout:payment.methods.${method}Hint`,
                                                        )}
                                                    </span>
                                                </span>
                                            </label>
                                        ))}
                                    </fieldset>
                                </Fieldset>
                            )}

                            {step === 'review' && (
                                <Fieldset title={t('checkout:review.title')}>
                                    <ReviewBlock
                                        title={t('checkout:review.contact')}
                                        onEdit={() => setStep('contact')}
                                    >
                                        {form.data.customer_name}
                                        <br />
                                        {form.data.customer_email}
                                        {form.data.customer_phone && (
                                            <>
                                                <br />
                                                {form.data.customer_phone}
                                            </>
                                        )}
                                    </ReviewBlock>

                                    <ReviewBlock
                                        title={t('checkout:review.shippingTo')}
                                        onEdit={() => setStep('shipping')}
                                    >
                                        〒{form.data.postal_code}
                                        <br />
                                        {form.data.prefecture}
                                        {form.data.city &&
                                            `, ${form.data.city}`}
                                        <br />
                                        {form.data.address_line1}
                                        {form.data.address_line2 && (
                                            <>
                                                <br />
                                                {form.data.address_line2}
                                            </>
                                        )}
                                    </ReviewBlock>

                                    <ReviewBlock
                                        title={t(
                                            'checkout:review.paymentMethod',
                                        )}
                                        onEdit={() => setStep('payment')}
                                    >
                                        {t(
                                            `checkout:payment.methods.${form.data.payment_method}`,
                                        )}
                                    </ReviewBlock>

                                    <Textarea
                                        label={t('checkout:review.notes')}
                                        placeholder={t(
                                            'checkout:review.notesPlaceholder',
                                        )}
                                        rows={3}
                                        value={form.data.notes}
                                        error={errors.notes}
                                        onChange={(event) =>
                                            form.setData(
                                                'notes',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Fieldset>
                            )}
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            {stepIndex > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setStep(STEPS[stepIndex - 1])
                                    }
                                >
                                    {t('checkout:nav.back')}
                                </Button>
                            )}

                            {step === 'review' ? (
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={form.processing}
                                >
                                    {form.processing
                                        ? t('checkout:review.placing')
                                        : t('checkout:review.placeOrder')}
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    withArrow
                                    onClick={() =>
                                        setStep(STEPS[stepIndex + 1])
                                    }
                                >
                                    {t('checkout:nav.next')}
                                </Button>
                            )}
                        </div>
                    </form>

                    <aside className="lg:sticky lg:top-28 lg:self-start">
                        <ul className="mb-4 flex flex-col gap-3">
                            {lines.map((line) => (
                                <li
                                    key={line.id}
                                    className="flex items-center gap-3"
                                >
                                    <span className="relative w-14 shrink-0">
                                        <Media
                                            media={line.media}
                                            ratio="1/1"
                                            label={`Product — ${line.name}`}
                                            rounded="card"
                                        />
                                        <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-forest text-[0.625rem] font-semibold text-cream">
                                            {line.quantity}
                                        </span>
                                    </span>

                                    <span className="min-w-0 flex-1 truncate text-small">
                                        {line.name}
                                    </span>

                                    <Price
                                        amount={line.lineTotalMinor}
                                        currency={totals.currency}
                                        size="sm"
                                    />
                                </li>
                            ))}
                        </ul>

                        <OrderSummary totals={totals} />
                    </aside>
                </div>
            </div>
        </>
    );
}

function StepNav({
    active,
    onSelect,
    errors,
}: {
    active: Step;
    onSelect: (step: Step) => void;
    errors: Record<string, string | undefined>;
}) {
    const { t } = useTranslation('checkout');
    const activeIndex = STEPS.indexOf(active);

    return (
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
            {STEPS.map((step, index) => {
                const isActive = step === active;
                const isDone = index < activeIndex;
                const hasError = STEP_FIELDS[step].some(
                    (field) => errors[field],
                );

                return (
                    <li key={step} className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-current={isActive ? 'step' : undefined}
                            onClick={() => onSelect(step)}
                            className={cn(
                                'flex items-center gap-2 rounded-btn px-2.5 py-1.5 text-small transition-colors',
                                isActive
                                    ? 'text-ink'
                                    : 'text-ink-muted hover:text-ink',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-6 items-center justify-center rounded-full border text-[0.6875rem] font-semibold',
                                    hasError
                                        ? 'border-chilli bg-chilli text-white'
                                        : isActive
                                          ? 'border-gold bg-gold text-white'
                                          : isDone
                                            ? 'border-forest-500 bg-forest-500 text-cream'
                                            : 'border-line text-ink-muted',
                                )}
                            >
                                {isDone && !hasError ? (
                                    <CheckIcon width={12} height={12} />
                                ) : (
                                    index + 1
                                )}
                            </span>
                            {t(`steps.${step}`)}
                        </button>

                        {index < STEPS.length - 1 && (
                            <span
                                className="h-px w-4 bg-line sm:w-8"
                                aria-hidden
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

function Fieldset({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="grid gap-4">
            <h2 className="font-display text-2xl font-medium">{title}</h2>
            {children}
        </section>
    );
}

function ReviewBlock({
    title,
    onEdit,
    children,
}: {
    title: string;
    onEdit: () => void;
    children: React.ReactNode;
}) {
    const { t } = useTranslation('checkout');

    return (
        <div className="rounded-card border border-hairline bg-surface p-4">
            <div className="flex items-baseline justify-between gap-3">
                <h3 className="drio-eyebrow text-ink-muted">{title}</h3>
                <button
                    type="button"
                    onClick={onEdit}
                    className="text-small text-gold-700 transition-colors hover:text-gold"
                >
                    {t('review.edit')}
                </button>
            </div>

            <p className="mt-2 text-copy text-ink">{children}</p>
        </div>
    );
}
