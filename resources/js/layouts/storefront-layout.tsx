import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CartDrawer } from '@/components/storefront/cart-drawer';
import { SiteFooter } from '@/components/storefront/site-footer';
import { SiteHeader } from '@/components/storefront/site-header';
import { useCart } from '@/hooks/use-cart';
import { useLocale } from '@/hooks/use-locale';

/**
 * The public storefront shell.
 *
 * Deliberately shares nothing with the admin console — not the layout, not the
 * navigation, not the type scale (§12). The `drio-storefront` class pins this
 * tree to the brand's fixed light palette regardless of the starter kit's
 * appearance toggle.
 *
 * `<main>` carries no top padding: the header is fixed and overlays the hero
 * by design (§7.1), so pages that do not open with a hero add their own.
 *
 * `overlayHeader` is the layout prop that decides whether the header starts
 * transparent. Only a page that opens with a dark full-bleed hero may set it —
 * cream nav text over a cream page is unreadable, so the default is the solid
 * bar and the homepage opts in with `setLayoutProps`.
 */
export default function StorefrontLayout({
    children,
    overlayHeader = false,
}: {
    children: ReactNode;
    overlayHeader?: boolean;
}) {
    const { t } = useTranslation('common');
    const { activeMeta } = useLocale();
    const { count } = useCart();

    return (
        <div
            className="drio-storefront flex min-h-screen flex-col"
            lang={activeMeta?.code}
        >
            <a
                href="#main"
                className="sr-only bg-forest text-cream focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[80] focus:rounded-btn focus:px-4 focus:py-2 focus:ring-2 focus:ring-gold-200"
            >
                {t('actions.skipToContent')}
            </a>

            <SiteHeader cartCount={count} overlay={overlayHeader} />

            <main id="main" className="flex-1">
                {children}
            </main>

            <SiteFooter />

            <CartDrawer />
        </div>
    );
}
