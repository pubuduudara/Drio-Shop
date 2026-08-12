import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

export type LocaleSwitcherProps = {
    /** `light` for the transparent header over the hero and the mobile drawer. */
    tone?: 'light' | 'dark';
    className?: string;
};

/**
 * The `EN / 日本語` toggle (§7.1).
 *
 * It renders nothing while a single locale is enabled — the header ships clean
 * without the switcher being commented out or missing, so the layout already
 * accommodates it. Adding a locale to `config/locales.php` is what makes it
 * appear; no component changes.
 */
export function LocaleSwitcher({
    tone = 'dark',
    className,
}: LocaleSwitcherProps) {
    const { t } = useTranslation('common');
    const {
        locale,
        defaultLocale,
        enabledLocales,
        localeMeta,
        isSingleLocale,
    } = useLocale();

    if (isSingleLocale) {
        return null;
    }

    /**
     * Swaps the locale segment on the current URL, mirroring the server's
     * strategy: the default locale is unprefixed, every other locale carries
     * `/{locale}` (§9.2).
     */
    const urlForLocale = (target: string): string => {
        const { pathname, search, hash } = window.location;
        const segments = pathname.split('/').filter(Boolean);

        if (segments.length > 0 && enabledLocales.includes(segments[0])) {
            segments.shift();
        }

        const prefix = target === defaultLocale ? [] : [target];
        const path = [...prefix, ...segments].join('/');

        return `/${path}${search}${hash}`;
    };

    return (
        <div
            className={cn('flex items-center gap-1.5', className)}
            role="group"
            aria-label={t('labels.language')}
        >
            {enabledLocales.map((code, index) => {
                const meta = localeMeta[code];
                const isActive = code === locale;

                return (
                    <span key={code} className="flex items-center gap-1.5">
                        {index > 0 && (
                            <span
                                className={cn(
                                    'text-small',
                                    tone === 'light'
                                        ? 'text-cream/40'
                                        : 'text-line',
                                )}
                                aria-hidden
                            >
                                /
                            </span>
                        )}
                        <button
                            type="button"
                            lang={code}
                            aria-current={isActive ? 'true' : undefined}
                            onClick={() => router.visit(urlForLocale(code))}
                            className={cn(
                                'text-small font-medium transition-colors',
                                isActive
                                    ? 'text-gold'
                                    : tone === 'light'
                                      ? 'text-cream/70 hover:text-cream'
                                      : 'text-ink-muted hover:text-ink',
                            )}
                        >
                            {meta?.label ?? code.toUpperCase()}
                        </button>
                    </span>
                );
            })}
        </div>
    );
}
