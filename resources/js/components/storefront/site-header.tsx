import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CountBadge } from '@/components/drio/badge';
import { IconButton } from '@/components/drio/icon-button';
import {
    BagIcon,
    CloseIcon,
    HeartIcon,
    MenuIcon,
    SearchIcon,
} from '@/components/drio/icons/ui';
import { LocaleSwitcher } from '@/components/drio/locale-switcher';
import { Wordmark } from '@/components/drio/wordmark';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';
import { about, contact, home, shop } from '@/routes';
import { index as recipesIndex } from '@/routes/recipes';

/**
 * The site header (§7.1).
 *
 * Transparent and overlaid on the hero at scroll-top with white text, then a
 * solid `forest` bar with a hairline bottom border past 80px. It is `fixed`
 * rather than sticky so the hero can sit underneath it — the hero reserves no
 * space for the header, which is what makes the overlay work.
 *
 * `overlay` is what a page grants that treatment. Only the homepage does: its
 * hero is a dark full-bleed panel that cream nav text reads against. Every
 * other page has a cream or sand band up there, so the header ships solid from
 * the first pixel rather than rendering itself invisible.
 */

const SCROLL_THRESHOLD = 80;

type NavItem = {
    key: string;
    href: string;
    /**
     * Extra path prefixes the item owns. A product or category page belongs to
     * Shop even though its URL says nothing about shopping.
     */
    owns?: string[];
};

const NAV_ITEMS: NavItem[] = [
    { key: 'home', href: home().url },
    { key: 'shop', href: shop().url, owns: ['/products/', '/categories/'] },
    { key: 'recipes', href: recipesIndex().url },
    { key: 'about', href: about().url },
    { key: 'contact', href: contact().url },
];

/** Whether a nav item is the section the current URL belongs to. */
function isCurrentSection(currentUrl: string, item: NavItem): boolean {
    const path = currentUrl.split('?')[0];

    if (item.href === '/') {
        return path === '/';
    }

    return (
        path === item.href ||
        path.startsWith(`${item.href}/`) ||
        (item.owns?.some((prefix) => path.startsWith(prefix)) ?? false)
    );
}

export function SiteHeader({
    cartCount = 0,
    overlay = false,
}: {
    cartCount?: number;
    /** Whether the page beneath opens with a hero this may sit on top of. */
    overlay?: boolean;
}) {
    const { t } = useTranslation(['common', 'nav']);
    const { url } = usePage();
    const { count: wishlistCount } = useWishlist();
    const { openDrawer } = useCart();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // A drawer or overlay owns the viewport while it is open.
    useEffect(() => {
        const locked = isMobileOpen || isSearchOpen;
        document.body.style.overflow = locked ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileOpen, isSearchOpen]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMobileOpen(false);
                setIsSearchOpen(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Solid whenever the transparent treatment would be unreadable: on a page
    // with no hero behind it, past the scroll threshold, or while a panel is up.
    const isSolid = !overlay || isScrolled || isMobileOpen || isSearchOpen;
    const tone = isSolid ? 'solid' : 'transparent';

    return (
        <>
            <header
                className={cn(
                    'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
                    isSolid
                        ? 'border-b border-forest-500/40 bg-forest'
                        : 'border-b border-transparent bg-transparent',
                )}
            >
                <div className="mx-auto flex max-w-drio items-center justify-between gap-6 px-5 py-4 md:px-8 lg:px-10">
                    <Link
                        href={home()}
                        className="shrink-0"
                        aria-label={t('common:brand.name')}
                    >
                        <Wordmark tone="light" />
                    </Link>

                    <nav
                        aria-label={t('nav:aria.primary')}
                        className="hidden lg:block"
                    >
                        <ul className="flex items-center gap-8">
                            {NAV_ITEMS.map((item) => {
                                const isActive = isCurrentSection(url, item);

                                return (
                                    <li key={item.key}>
                                        <Link
                                            href={item.href}
                                            aria-current={
                                                isActive ? 'page' : undefined
                                            }
                                            className={cn(
                                                'relative py-1 text-copy transition-colors',
                                                isActive
                                                    ? 'text-cream'
                                                    : 'text-cream/75 hover:text-cream',
                                            )}
                                        >
                                            {t(`nav:primary.${item.key}`)}
                                            {/* The gold underline marking the active item. */}
                                            <span
                                                className={cn(
                                                    'absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300',
                                                    isActive ? 'w-full' : 'w-0',
                                                )}
                                            />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="flex items-center gap-1 md:gap-2">
                        <IconButton
                            variant="light"
                            label={t('common:actions.search')}
                            onClick={() => setIsSearchOpen(true)}
                            aria-expanded={isSearchOpen}
                        >
                            <SearchIcon />
                        </IconButton>

                        <IconButton
                            variant="light"
                            label={t('common:labels.wishlist')}
                            badge={
                                <CountBadge
                                    count={wishlistCount}
                                    label={t('common:labels.wishlist')}
                                />
                            }
                        >
                            <HeartIcon />
                        </IconButton>

                        <IconButton
                            variant="light"
                            label={t('common:labels.cart')}
                            onClick={openDrawer}
                            badge={
                                <CountBadge
                                    count={cartCount}
                                    label={t('common:labels.cart')}
                                />
                            }
                        >
                            <BagIcon />
                        </IconButton>

                        {/*
                         * The thin divider and the switcher slot. The switcher
                         * renders nothing while one locale is enabled, but the
                         * divider is tied to it so the header does not ship
                         * with a stray rule (§7.1).
                         */}
                        <LocaleSwitcher
                            tone="light"
                            className="ml-2 hidden border-l border-cream/25 pl-4 lg:flex"
                        />

                        <IconButton
                            variant="light"
                            label={t('common:actions.openMenu')}
                            onClick={() => setIsMobileOpen(true)}
                            aria-expanded={isMobileOpen}
                            className="lg:hidden"
                        >
                            <MenuIcon />
                        </IconButton>
                    </div>
                </div>
            </header>

            {isSearchOpen && (
                <SearchOverlay onClose={() => setIsSearchOpen(false)} />
            )}

            {isMobileOpen && (
                <MobileDrawer
                    items={NAV_ITEMS}
                    currentUrl={url}
                    onClose={() => setIsMobileOpen(false)}
                />
            )}

            {/* Keeps the tone available to tests and future sections. */}
            <span className="sr-only" data-header-tone={tone} />
        </>
    );
}

/**
 * The overlay search panel opened by the header's search icon (§7.1).
 *
 * Submitting navigates to the shop with the term applied, so search is one
 * filter of the catalogue rather than a second results page that would drift
 * out of step with the shop's own sorting and pagination.
 */
function SearchOverlay({ onClose }: { onClose: () => void }) {
    const { t } = useTranslation('common');
    const [term, setTerm] = useState('');

    return (
        <div
            className="fixed inset-0 z-40 flex items-start justify-center bg-forest/95 px-5 pt-28"
            role="dialog"
            aria-modal="true"
            aria-label={t('actions.search')}
        >
            <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between">
                    <span className="drio-eyebrow text-gold-200">
                        {t('actions.search')}
                    </span>
                    <IconButton
                        variant="light"
                        label={t('actions.close')}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>

                <form
                    className="mt-4 flex items-center gap-3 border-b border-cream/30 pb-3 transition-colors focus-within:border-gold-200"
                    onSubmit={(event) => {
                        event.preventDefault();

                        if (term.trim() === '') {
                            return;
                        }

                        onClose();
                        router.get(shop({ query: { q: term.trim() } }).url);
                    }}
                >
                    <SearchIcon className="shrink-0 text-cream/60" />
                    <input
                        type="search"
                        autoFocus
                        value={term}
                        onChange={(event) => setTerm(event.target.value)}
                        placeholder={t('search.placeholder')}
                        aria-label={t('actions.search')}
                        className="w-full bg-transparent py-2 text-2xl text-cream outline-none placeholder:text-cream/45"
                    />
                </form>

                <p className="mt-4 text-small text-cream/60">
                    {t('search.hint')}
                </p>
            </div>
        </div>
    );
}

/** The full-screen forest drawer on mobile (§7.1). */
function MobileDrawer({
    items,
    currentUrl,
    onClose,
}: {
    items: NavItem[];
    currentUrl: string;
    onClose: () => void;
}) {
    const { t } = useTranslation(['common', 'nav']);

    return (
        <div
            className="fixed inset-0 z-40 flex flex-col bg-forest lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav:aria.mobile')}
        >
            <div className="flex items-center justify-between px-5 py-4 md:px-8">
                <Wordmark tone="light" />
                <IconButton
                    variant="light"
                    label={t('common:actions.closeMenu')}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            </div>

            <nav
                aria-label={t('nav:aria.mobile')}
                className="flex-1 overflow-y-auto px-5 py-8 md:px-8"
            >
                <ul className="flex flex-col gap-1">
                    {items.map((item) => {
                        const isActive = isCurrentSection(currentUrl, item);

                        return (
                            <li key={item.key}>
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={cn(
                                        'block py-3 font-display text-3xl transition-colors',
                                        isActive
                                            ? 'text-gold'
                                            : 'text-cream hover:text-gold-200',
                                    )}
                                >
                                    {t(`nav:primary.${item.key}`)}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* The switcher is pinned to the drawer footer under the same
                one-locale rule as the desktop header (§7.1). */}
            <div className="border-t border-forest-500/40 px-5 py-5 md:px-8">
                <LocaleSwitcher tone="light" />
            </div>
        </div>
    );
}
