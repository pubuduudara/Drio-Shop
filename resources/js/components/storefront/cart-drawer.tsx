import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonLink } from '@/components/drio/button';
import { IconButton } from '@/components/drio/icon-button';
import { CloseIcon, MinusIcon, PlusIcon } from '@/components/drio/icons/ui';
import { Media } from '@/components/drio/media';
import { Price, formatPrice } from '@/components/drio/price';
import { FreeShippingProgress } from '@/components/storefront/free-shipping-progress';
import { useCart } from '@/hooks/use-cart';
import { useLocale } from '@/hooks/use-locale';
import { index as cartIndex } from '@/routes/cart';
import { show as checkoutShow } from '@/routes/checkout';

/**
 * The slide-over cart drawer the header's bag opens, and that add-to-cart pops
 * (§7.1, §7.4).
 *
 * Reads the shared cart prop through `useCart`, so it shows the basket the
 * server holds rather than a copy of it (§6).
 */
export function CartDrawer() {
    const { t } = useTranslation(['cart', 'common']);
    const { locale } = useLocale();
    const {
        lines,
        count,
        totals,
        remove,
        setQuantity,
        isDrawerOpen,
        closeDrawer,
    } = useCart();

    useEffect(() => {
        if (!isDrawerOpen) {
            return;
        }

        document.body.style.overflow = 'hidden';

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeDrawer();
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [isDrawerOpen, closeDrawer]);

    if (!isDrawerOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[70] flex justify-end">
            <button
                type="button"
                className="absolute inset-0 cursor-default bg-ink/45"
                aria-label={t('cart:drawer.close')}
                onClick={closeDrawer}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label={t('cart:drawer.title')}
                className="relative flex h-full w-full max-w-md flex-col bg-surface shadow-[-8px_0_40px_rgba(38,34,29,0.18)]"
            >
                <header className="flex items-center justify-between border-b border-hairline px-5 py-4">
                    <h2 className="font-display text-xl font-medium">
                        {t('cart:drawer.title')}
                        {count > 0 && (
                            <span className="ml-2 text-small text-ink-muted">
                                {t('cart:itemCount', { count })}
                            </span>
                        )}
                    </h2>

                    <IconButton
                        label={t('cart:drawer.close')}
                        onClick={closeDrawer}
                    >
                        <CloseIcon />
                    </IconButton>
                </header>

                {lines.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                        <p className="font-display text-xl">
                            {t('cart:empty.title')}
                        </p>
                        <p className="max-w-xs text-small text-ink-muted">
                            {t('cart:empty.body')}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={closeDrawer}
                        >
                            {t('cart:empty.action')}
                        </Button>
                    </div>
                ) : (
                    <>
                        <ul className="flex-1 overflow-y-auto px-5 py-4">
                            {lines.map((line) => (
                                <li
                                    key={line.id}
                                    className="flex gap-3 border-b border-hairline py-4 last:border-b-0"
                                >
                                    <span className="w-16 shrink-0">
                                        <Media
                                            media={line.media}
                                            ratio="1/1"
                                            label={`Product — ${line.name}`}
                                            rounded="card"
                                        />
                                    </span>

                                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                        <span className="truncate font-display text-title">
                                            {line.name}
                                        </span>

                                        <Price
                                            amount={line.unitPriceMinor}
                                            currency={totals.currency}
                                            size="sm"
                                        />

                                        <div className="mt-1 flex items-center justify-between gap-2">
                                            <span className="flex items-center rounded-btn border border-hairline">
                                                <IconButton
                                                    size="sm"
                                                    label={t(
                                                        'cart:actions.decrease',
                                                    )}
                                                    onClick={() =>
                                                        setQuantity(
                                                            line.id,
                                                            line.quantity - 1,
                                                        )
                                                    }
                                                >
                                                    <MinusIcon />
                                                </IconButton>
                                                <span className="w-8 text-center text-small tabular-nums">
                                                    {line.quantity}
                                                </span>
                                                <IconButton
                                                    size="sm"
                                                    label={t(
                                                        'cart:actions.increase',
                                                    )}
                                                    disabled={
                                                        line.quantity >=
                                                        line.stockQuantity
                                                    }
                                                    onClick={() =>
                                                        setQuantity(
                                                            line.id,
                                                            line.quantity + 1,
                                                        )
                                                    }
                                                >
                                                    <PlusIcon />
                                                </IconButton>
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => remove(line.id)}
                                                className="text-small text-ink-muted transition-colors hover:text-chilli"
                                            >
                                                {t('cart:actions.remove')}
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <footer className="flex flex-col gap-3 border-t border-hairline px-5 py-4">
                            <FreeShippingProgress totals={totals} />

                            <div
                                className="flex items-baseline justify-between"
                                aria-live="polite"
                            >
                                <span className="text-small text-ink-muted">
                                    {t('cart:summary.subtotal')}
                                </span>
                                <span className="font-display text-xl font-semibold">
                                    {formatPrice(
                                        totals.subtotalMinor,
                                        totals.currency,
                                        locale,
                                    )}
                                </span>
                            </div>

                            <ButtonLink
                                href={checkoutShow()}
                                variant="primary"
                                className="w-full"
                                onClick={closeDrawer}
                            >
                                {t('cart:actions.checkout')}
                            </ButtonLink>

                            <ButtonLink
                                href={cartIndex()}
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={closeDrawer}
                            >
                                {t('cart:actions.viewCart')}
                            </ButtonLink>
                        </footer>
                    </>
                )}
            </aside>
        </div>
    );
}
