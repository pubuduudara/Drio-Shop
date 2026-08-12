import { Form, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { dashboard } from '@/routes/admin';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as heroSlidesIndex } from '@/routes/admin/hero-slides';
import { index as ordersIndex } from '@/routes/admin/orders';
import { index as productsIndex } from '@/routes/admin/products';
import { index as recipesIndex } from '@/routes/admin/recipes';
import { index as reviewsIndex } from '@/routes/admin/reviews';
import { edit as settingsEdit } from '@/routes/admin/settings';
import { index as subscribersIndex } from '@/routes/admin/subscribers';

/**
 * The admin console shell (§8).
 *
 * A work tool, not a brand experience: forest sidebar, white content area,
 * Inter throughout with no display serif, 13px base and tight rows. It shares
 * no layout, navigation or type scale with the storefront by design (§12).
 */

type AdminNavItem = {
    key: string;
    href: string;
};

const NAV_ITEMS: AdminNavItem[] = [
    { key: 'dashboard', href: dashboard.url() },
    { key: 'products', href: productsIndex.url() },
    { key: 'categories', href: categoriesIndex.url() },
    { key: 'orders', href: ordersIndex.url() },
    { key: 'recipes', href: recipesIndex.url() },
    { key: 'reviews', href: reviewsIndex.url() },
    { key: 'heroSlides', href: heroSlidesIndex.url() },
    { key: 'subscribers', href: subscribersIndex.url() },
    { key: 'settings', href: settingsEdit.url() },
];

export default function AdminLayout({
    children,
    title,
}: {
    children: ReactNode;
    title?: string;
}) {
    const { t } = useTranslation('admin');
    const { url } = usePage();
    const [isNavOpen, setIsNavOpen] = useState(false);

    useFlashToast();

    return (
        <div className="flex min-h-screen bg-white font-body text-[13px] text-neutral-900">
            {/* §11 — the console is navigable end to end from a keyboard, and
                that starts with not having to tab through the whole sidebar. */}
            <a
                href="#admin-main"
                className="sr-only bg-forest text-cream focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:px-3 focus:py-2"
            >
                {t('shell.skipToContent')}
            </a>

            <Sidebar
                currentUrl={url}
                className={cn(
                    'fixed inset-y-0 left-0 z-40 w-56 md:static md:flex',
                    isNavOpen ? 'flex' : 'hidden',
                )}
                onNavigate={() => setIsNavOpen(false)}
            />

            {isNavOpen && (
                <button
                    type="button"
                    aria-label={t('shell.toggleSidebar')}
                    onClick={() => setIsNavOpen(false)}
                    className="fixed inset-0 z-30 cursor-default bg-neutral-900/40 md:hidden"
                />
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-5">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsNavOpen((open) => !open)}
                            aria-expanded={isNavOpen}
                            className="rounded border border-neutral-200 px-2 py-1 text-[12px] md:hidden"
                        >
                            {t('shell.toggleSidebar')}
                        </button>

                        <span className="text-sm font-semibold">
                            {title ?? t('shell.title')}
                        </span>
                    </div>

                    <Form {...logout.form()}>
                        <button
                            type="submit"
                            className="rounded px-2 py-1 text-[12px] text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                        >
                            {t('shell.signOut')}
                        </button>
                    </Form>
                </header>

                <main id="admin-main" className="flex-1 px-5 py-5">
                    {children}
                </main>
            </div>
        </div>
    );
}

function Sidebar({
    currentUrl,
    className,
    onNavigate,
}: {
    currentUrl: string;
    className?: string;
    onNavigate: () => void;
}) {
    const { t } = useTranslation('admin');

    return (
        <aside
            className={cn(
                'w-56 shrink-0 flex-col bg-forest text-cream/80',
                className,
            )}
        >
            <div className="border-b border-forest-500/40 px-4 py-4">
                <span className="text-sm font-semibold tracking-wide text-cream">
                    {t('shell.title')}
                </span>
            </div>

            <nav aria-label={t('shell.title')} className="flex-1 px-2 py-3">
                <ul className="flex flex-col gap-0.5">
                    {NAV_ITEMS.map((item) => (
                        <li key={item.key}>
                            <Link
                                href={item.href}
                                onClick={onNavigate}
                                aria-current={
                                    isCurrent(currentUrl, item.href)
                                        ? 'page'
                                        : undefined
                                }
                                className={cn(
                                    'block rounded px-3 py-1.5 transition-colors',
                                    isCurrent(currentUrl, item.href)
                                        ? 'bg-forest-700 text-cream'
                                        : 'hover:bg-forest-700 hover:text-cream',
                                )}
                            >
                                {t(`nav.${item.key}`)}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

/**
 * `/admin` matches only itself; every other item matches its whole subtree so
 * a product's edit form still marks Products as the current section.
 */
function isCurrent(currentUrl: string, href: string): boolean {
    const path = currentUrl.split('?')[0].replace(/\/$/, '');
    const target = href.replace(/\/$/, '');

    return target === '/admin' ? path === target : path.startsWith(target);
}
