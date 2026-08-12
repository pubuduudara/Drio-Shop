import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { EmptyRow, TableShell, Td, Th, Tr } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { exportMethod, index } from '@/routes/admin/subscribers';
import type { Paginated, SubscriberRow } from '@/types/admin';

/**
 * The newsletter list (§8), with a CSV export.
 */
const SEARCH_DEBOUNCE_MS = 300;

export default function SubscribersIndex({
    subscribers,
    filters,
    total,
}: {
    subscribers: Paginated<SubscriberRow>;
    filters: { search: string };
    total: number;
}) {
    const { t } = useTranslation('admin');
    const [search, setSearch] = useState(filters.search);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timer = window.setTimeout(() => {
            router.get(
                index().url,
                { search: search || undefined },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [search]);

    return (
        <>
            <Head title={t('subscribers.title')} />

            <PageHeader
                title={t('subscribers.title')}
                description={t('subscribers.count', { count: total })}
                actions={
                    <Button size="sm" variant="outline" asChild>
                        {/* A file download, so a real navigation rather than
                            an Inertia visit. */}
                        <a href={exportMethod().url}>
                            {t('subscribers.export')}
                        </a>
                    </Button>
                }
            />

            <div className="mb-3 flex max-w-64 min-w-52 flex-col gap-1.5">
                <label
                    htmlFor="subscriber-search"
                    className="text-[13px] font-medium"
                >
                    {t('actions.search')}
                </label>
                <Input
                    id="subscriber-search"
                    type="search"
                    value={search}
                    placeholder={t('subscribers.searchPlaceholder')}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-8 text-[13px]"
                />
            </div>

            <TableShell>
                <thead>
                    <tr>
                        <Th>{t('subscribers.columns.email')}</Th>
                        <Th className="w-24">
                            {t('subscribers.columns.locale')}
                        </Th>
                        <Th className="w-32">
                            {t('subscribers.columns.confirmed')}
                        </Th>
                        <Th className="w-32">
                            {t('subscribers.columns.subscribed')}
                        </Th>
                    </tr>
                </thead>

                <tbody>
                    {subscribers.data.length === 0 && (
                        <EmptyRow colSpan={4}>
                            {filters.search
                                ? t('subscribers.empty')
                                : t('subscribers.emptyAll')}
                        </EmptyRow>
                    )}

                    {subscribers.data.map((subscriber) => (
                        <Tr key={subscriber.id}>
                            <Td>{subscriber.email}</Td>
                            <Td className="text-neutral-500 uppercase">
                                {subscriber.locale}
                            </Td>
                            <Td className="text-neutral-500">
                                {subscriber.confirmedAt ?? '—'}
                            </Td>
                            <Td className="text-neutral-500">
                                {subscriber.subscribedAt}
                            </Td>
                        </Tr>
                    ))}
                </tbody>
            </TableShell>

            <Pagination meta={subscribers.meta} links={subscribers.links} />
        </>
    );
}
