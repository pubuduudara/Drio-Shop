import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyRow, TableShell, Td, Th, Tr } from '@/components/admin/table';
import { formatPrice } from '@/components/drio/price';
import { useLocale } from '@/hooks/use-locale';
import { edit } from '@/routes/admin/products';
import type {
    BestSellingProduct,
    OrderStatusCount,
    ProductRow,
    RecentOrder,
} from '@/types/admin';

/**
 * The console landing page (§8).
 *
 * Orders arrive in Phase 6, so the order panels render their empty states
 * today rather than being absent — the dashboard's shape should not change
 * when data starts flowing into it.
 */

const LOW_STOCK_THRESHOLD = 10;

type Props = {
    revenue: { totalMinor: number; currency: string; orderCount: number };
    ordersByStatus: OrderStatusCount[];
    lowStock: ProductRow[];
    recentOrders: RecentOrder[];
    bestSellers: BestSellingProduct[];
    catalogue: { activeProducts: number; inactiveProducts: number };
};

export default function AdminDashboard({
    revenue,
    ordersByStatus,
    lowStock,
    recentOrders,
    bestSellers,
    catalogue,
}: Props) {
    const { t } = useTranslation('admin');
    const { locale } = useLocale();

    return (
        <>
            <Head title={t('dashboard.title')} />

            <PageHeader title={t('dashboard.title')} />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Panel title={t('dashboard.revenue.title')}>
                    <p className="text-2xl font-semibold tabular-nums">
                        {formatPrice(
                            revenue.totalMinor,
                            revenue.currency,
                            locale,
                        )}
                    </p>
                    <p className="mt-0.5 text-neutral-500">
                        {t('dashboard.revenue.orders', {
                            count: revenue.orderCount,
                        })}
                    </p>
                </Panel>

                <Panel title={t('dashboard.catalogue.title')}>
                    <p className="text-2xl font-semibold tabular-nums">
                        {catalogue.activeProducts}
                    </p>
                    <p className="mt-0.5 text-neutral-500">
                        {t('dashboard.catalogue.active', {
                            count: catalogue.activeProducts,
                        })}
                        {' · '}
                        {t('dashboard.catalogue.inactive', {
                            count: catalogue.inactiveProducts,
                        })}
                    </p>
                </Panel>

                <Panel title={t('dashboard.ordersByStatus')}>
                    <ul className="grid gap-1">
                        {ordersByStatus.map((entry) => (
                            <li
                                key={entry.status}
                                className="flex items-center justify-between"
                            >
                                <span className="text-neutral-600">
                                    {t(`orderStatus.${entry.status}`)}
                                </span>
                                <span className="tabular-nums">
                                    {entry.count}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <Panel
                    title={t('dashboard.lowStock.title')}
                    description={t('dashboard.lowStock.description', {
                        threshold: LOW_STOCK_THRESHOLD,
                    })}
                >
                    {lowStock.length === 0 ? (
                        <p className="text-neutral-500">
                            {t('dashboard.lowStock.empty')}
                        </p>
                    ) : (
                        <ul className="grid gap-1">
                            {lowStock.map((product) => (
                                <li
                                    key={product.id}
                                    className="flex items-center justify-between gap-3"
                                >
                                    <Link
                                        href={edit(product.id)}
                                        className="truncate hover:underline"
                                    >
                                        {product.name}
                                    </Link>
                                    <span
                                        className={
                                            product.stockQuantity === 0
                                                ? 'shrink-0 text-red-700 tabular-nums'
                                                : 'shrink-0 text-amber-700 tabular-nums'
                                        }
                                    >
                                        {product.stockQuantity}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel title={t('dashboard.bestSellers.title')}>
                    {bestSellers.length === 0 ? (
                        <p className="text-neutral-500">
                            {t('dashboard.bestSellers.empty')}
                        </p>
                    ) : (
                        <ul className="grid gap-1">
                            {bestSellers.map((product) => (
                                <li
                                    key={product.id}
                                    className="flex items-center justify-between gap-3"
                                >
                                    <span className="truncate">
                                        {product.name}
                                    </span>
                                    <span className="shrink-0 text-neutral-500 tabular-nums">
                                        {t('dashboard.bestSellers.units', {
                                            count: product.unitsSold,
                                        })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>

            <section className="mt-3">
                <h2 className="mb-2 text-[13px] font-semibold">
                    {t('dashboard.recentOrders.title')}
                </h2>

                <TableShell>
                    <thead>
                        <tr>
                            <Th>
                                {t('dashboard.recentOrders.columns.number')}
                            </Th>
                            <Th>
                                {t('dashboard.recentOrders.columns.customer')}
                            </Th>
                            <Th className="w-32">
                                {t('dashboard.recentOrders.columns.status')}
                            </Th>
                            <Th className="w-28">
                                {t('dashboard.recentOrders.columns.total')}
                            </Th>
                            <Th className="w-28">
                                {t('dashboard.recentOrders.columns.placed')}
                            </Th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.length === 0 && (
                            <EmptyRow colSpan={5}>
                                {t('dashboard.recentOrders.empty')}
                            </EmptyRow>
                        )}

                        {recentOrders.map((order) => (
                            <Tr key={order.id}>
                                <Td className="font-mono text-[12px]">
                                    {order.orderNumber}
                                </Td>
                                <Td>{order.customerName}</Td>
                                <Td>{t(`orderStatus.${order.status}`)}</Td>
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
            </section>
        </>
    );
}

function Panel({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-md border border-neutral-200 p-4">
            <h2 className="text-[11px] font-semibold tracking-[0.08em] text-neutral-500 uppercase">
                {title}
            </h2>
            {description && (
                <p className="mt-0.5 text-[11px] text-neutral-400">
                    {description}
                </p>
            )}
            <div className="mt-2">{children}</div>
        </section>
    );
}
