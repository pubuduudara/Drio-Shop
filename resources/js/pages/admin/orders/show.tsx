import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminSelect, FormSection } from '@/components/admin/form';
import { PageHeader } from '@/components/admin/page-header';
import { StatusPill } from '@/components/admin/status-pill';
import { TableShell, Td, Th, Tr } from '@/components/admin/table';
import { formatPrice } from '@/components/drio/price';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/use-locale';
import {
    index,
    packingSlip,
    status as statusRoute,
} from '@/routes/admin/orders';
import type { Order } from '@/types/cart';

/**
 * One order (§8): line items, customer, shipping address, status transitions
 * with a note, and a link to the packing slip.
 */
export default function OrderShow({
    order,
    allowedTransitions,
}: {
    order: Order;
    /** Only the moves the enum allows from here, so the select cannot offer
     * a transition the request would then reject. */
    allowedTransitions: string[];
}) {
    const { t } = useTranslation('admin');
    const { locale } = useLocale();

    const money = (minor: number) =>
        formatPrice(minor, order.totals.currency, locale);

    const form = useForm({
        status: allowedTransitions[0] ?? '',
        note: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.patch(statusRoute(order.id).url, {
            preserveScroll: true,
            onSuccess: () => form.reset('note'),
        });
    };

    return (
        <>
            <Head title={order.orderNumber} />

            <PageHeader
                title={order.orderNumber}
                description={order.placedAt?.slice(0, 10)}
                actions={
                    <>
                        <Button size="sm" variant="ghost" asChild>
                            <Link href={index()}>{t('actions.back')}</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                            {/* A real navigation, not an Inertia visit: the
                                packing slip is a Blade document. */}
                            <a
                                href={packingSlip(order.id).url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {t('orders.packingSlip')}
                            </a>
                        </Button>
                    </>
                }
            />

            <div className="grid max-w-5xl gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div className="grid gap-4">
                    <FormSection title={t('orders.items')}>
                        <TableShell>
                            <thead>
                                <tr>
                                    <Th>{t('orders.columns.item')}</Th>
                                    <Th className="w-20 text-right">
                                        {t('orders.columns.quantity')}
                                    </Th>
                                    <Th className="w-28 text-right">
                                        {t('orders.columns.unitPrice')}
                                    </Th>
                                    <Th className="w-28 text-right">
                                        {t('orders.columns.lineTotal')}
                                    </Th>
                                </tr>
                            </thead>
                            <tbody>
                                {(order.items ?? []).map((item) => (
                                    <Tr key={item.id}>
                                        <Td>
                                            {item.name}
                                            <div className="font-mono text-[11px] text-neutral-500">
                                                {item.sku}
                                            </div>
                                        </Td>
                                        <Td className="text-right tabular-nums">
                                            {item.quantity}
                                        </Td>
                                        <Td className="text-right tabular-nums">
                                            {money(item.unitPriceMinor)}
                                        </Td>
                                        <Td className="text-right tabular-nums">
                                            {money(item.lineTotalMinor)}
                                        </Td>
                                    </Tr>
                                ))}
                            </tbody>
                        </TableShell>

                        <dl className="ml-auto grid w-56 gap-1">
                            <Total
                                label={t('orders.subtotal')}
                                value={money(order.totals.subtotalMinor)}
                            />
                            <Total
                                label={t('orders.shipping')}
                                value={money(order.totals.shippingMinor)}
                            />
                            <Total
                                label={t('orders.total')}
                                value={money(order.totals.totalMinor)}
                                emphasis
                            />
                        </dl>
                    </FormSection>

                    <FormSection title={t('orders.statusHistory')}>
                        {order.notes ? (
                            <pre className="font-body text-[12px] whitespace-pre-wrap text-neutral-600">
                                {order.notes}
                            </pre>
                        ) : (
                            <p className="text-neutral-500">
                                {t('orders.noNotes')}
                            </p>
                        )}
                    </FormSection>
                </div>

                <div className="grid gap-4">
                    <FormSection title={t('orders.status')}>
                        <p>
                            <StatusPill status={order.status} />
                        </p>

                        {allowedTransitions.length === 0 ? (
                            <p className="text-neutral-500">
                                {t('orders.terminal')}
                            </p>
                        ) : (
                            <form onSubmit={submit} className="grid gap-3">
                                <AdminSelect
                                    label={t('orders.moveTo')}
                                    value={form.data.status}
                                    error={form.errors.status}
                                    options={allowedTransitions.map(
                                        (value) => ({
                                            value,
                                            label: t(`orderStatus.${value}`),
                                        }),
                                    )}
                                    onChange={(event) =>
                                        form.setData(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                />

                                <div className="grid gap-1.5">
                                    <label
                                        htmlFor="status-note"
                                        className="text-[13px] font-medium"
                                    >
                                        {t('orders.note')}
                                    </label>
                                    <textarea
                                        id="status-note"
                                        rows={3}
                                        value={form.data.note}
                                        onChange={(event) =>
                                            form.setData(
                                                'note',
                                                event.target.value,
                                            )
                                        }
                                        placeholder={t(
                                            'orders.notePlaceholder',
                                        )}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-[13px] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={form.processing}
                                >
                                    {t('orders.saveStatus')}
                                </Button>
                            </form>
                        )}
                    </FormSection>

                    <FormSection title={t('orders.customer')}>
                        <dl className="grid gap-1.5">
                            <Detail
                                label={t('orders.name')}
                                value={order.customer.name}
                            />
                            <Detail
                                label={t('orders.email')}
                                value={order.customer.email}
                            />
                            {order.customer.phone && (
                                <Detail
                                    label={t('orders.phone')}
                                    value={order.customer.phone}
                                />
                            )}
                        </dl>
                    </FormSection>

                    <FormSection title={t('orders.shippingAddress')}>
                        <address className="text-[13px] not-italic">
                            〒{order.shippingAddress.postalCode}
                            <br />
                            {order.shippingAddress.prefecture},{' '}
                            {order.shippingAddress.city}
                            <br />
                            {order.shippingAddress.addressLine1}
                            {order.shippingAddress.addressLine2 && (
                                <>
                                    <br />
                                    {order.shippingAddress.addressLine2}
                                </>
                            )}
                        </address>
                    </FormSection>
                </div>
            </div>
        </>
    );
}

function Total({
    label,
    value,
    emphasis = false,
}: {
    label: string;
    value: string;
    emphasis?: boolean;
}) {
    return (
        <div
            className={`flex items-baseline justify-between gap-3 ${
                emphasis
                    ? 'mt-1 border-t border-neutral-200 pt-1 font-semibold'
                    : ''
            }`}
        >
            <dt className="text-neutral-500">{label}</dt>
            <dd className="tabular-nums">{value}</dd>
        </div>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline gap-3">
            <dt className="w-16 shrink-0 text-neutral-500">{label}</dt>
            <dd className="min-w-0 break-words">{value}</dd>
        </div>
    );
}
