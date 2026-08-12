import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminInput, AdminSelect } from '@/components/admin/form';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { StatusPill } from '@/components/admin/status-pill';
import { EmptyRow, TableShell, Td, Th, Tr } from '@/components/admin/table';
import { formatPrice } from '@/components/drio/price';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/use-locale';
import { index, show } from '@/routes/admin/orders';
import type { OrderRow, Paginated } from '@/types/admin';

/**
 * The orders table (§8): status filter, date range and search, all in the URL
 * so a filtered view is shareable and survives a refresh.
 */

type Filters = {
    search: string;
    status: string;
    from: string | null;
    to: string | null;
};

const SEARCH_DEBOUNCE_MS = 300;

export default function OrdersIndex({
    orders,
    filters,
    statuses,
}: {
    orders: Paginated<OrderRow>;
    filters: Filters;
    statuses: string[];
}) {
    const { t } = useTranslation('admin');
    const { locale } = useLocale();
    const [search, setSearch] = useState(filters.search);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timer = window.setTimeout(
            () => apply({ ...filters, search }),
            SEARCH_DEBOUNCE_MS,
        );

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const hasFilters =
        filters.search !== '' ||
        filters.status !== '' ||
        filters.from !== null ||
        filters.to !== null;

    return (
        <>
            <Head title={t('orders.title')} />

            <PageHeader
                title={t('orders.title')}
                description={t('orders.count', { count: orders.meta.total })}
            />

            <div className="mb-3 flex flex-wrap items-end gap-2">
                <div className="flex min-w-52 flex-col gap-1.5">
                    <label
                        htmlFor="order-search"
                        className="text-[13px] font-medium"
                    >
                        {t('actions.search')}
                    </label>
                    <Input
                        id="order-search"
                        type="search"
                        value={search}
                        placeholder={t('orders.searchPlaceholder')}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-8 text-[13px]"
                    />
                </div>

                <AdminSelect
                    label={t('orders.columns.status')}
                    className="min-w-40"
                    value={filters.status}
                    placeholder={t('orders.allStatuses')}
                    options={statuses.map((status) => ({
                        value: status,
                        label: t(`orderStatus.${status}`),
                    }))}
                    onChange={(event) =>
                        apply({
                            ...filters,
                            search,
                            status: event.target.value,
                        })
                    }
                />

                <AdminInput
                    type="date"
                    label={t('orders.from')}
                    className="min-w-40"
                    value={filters.from ?? ''}
                    onChange={(event) =>
                        apply({
                            ...filters,
                            search,
                            from: event.target.value || null,
                        })
                    }
                />

                <AdminInput
                    type="date"
                    label={t('orders.to')}
                    className="min-w-40"
                    value={filters.to ?? ''}
                    onChange={(event) =>
                        apply({
                            ...filters,
                            search,
                            to: event.target.value || null,
                        })
                    }
                />

                {hasFilters && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setSearch('');
                            apply({
                                search: '',
                                status: '',
                                from: null,
                                to: null,
                            });
                        }}
                    >
                        {t('actions.clear')}
                    </Button>
                )}
            </div>

            <TableShell>
                <thead>
                    <tr>
                        <Th>{t('orders.columns.number')}</Th>
                        <Th>{t('orders.columns.customer')}</Th>
                        <Th className="w-28">{t('orders.columns.status')}</Th>
                        <Th className="w-20">{t('orders.columns.items')}</Th>
                        <Th className="w-28">{t('orders.columns.total')}</Th>
                        <Th className="w-36">{t('orders.columns.placed')}</Th>
                    </tr>
                </thead>

                <tbody>
                    {orders.data.length === 0 && (
                        <EmptyRow colSpan={6}>
                            {hasFilters
                                ? t('orders.empty')
                                : t('orders.emptyAll')}
                        </EmptyRow>
                    )}

                    {orders.data.map((order) => (
                        <Tr key={order.id}>
                            <Td>
                                <Link
                                    href={show(order.id)}
                                    className="font-mono text-[12px] font-medium text-neutral-900 hover:underline"
                                >
                                    {order.orderNumber}
                                </Link>
                            </Td>
                            <Td>
                                {order.customerName}
                                <div className="text-[11px] text-neutral-500">
                                    {order.customerEmail}
                                </div>
                            </Td>
                            <Td>
                                <StatusPill status={order.status} />
                            </Td>
                            <Td className="tabular-nums">{order.itemCount}</Td>
                            <Td className="tabular-nums">
                                {formatPrice(
                                    order.totalMinor,
                                    order.currency,
                                    locale,
                                )}
                            </Td>
                            <Td className="text-neutral-500">
                                {order.placedAt}
                            </Td>
                        </Tr>
                    ))}
                </tbody>
            </TableShell>

            <Pagination meta={orders.meta} links={orders.links} />
        </>
    );
}

function apply(filters: Filters): void {
    router.get(
        index().url,
        {
            search: filters.search || undefined,
            status: filters.status || undefined,
            from: filters.from ?? undefined,
            to: filters.to ?? undefined,
        },
        { preserveState: true, replace: true, preserveScroll: true },
    );
}
