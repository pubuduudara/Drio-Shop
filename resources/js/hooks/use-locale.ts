import { usePage } from '@inertiajs/react';
import i18n from 'i18next';
import { useCallback, useEffect } from 'react';
import type { LocaleCode, LocaleMeta, LocaleState } from '@/types/locale';

/**
 * The active locale, as resolved by the SetLocale middleware, plus everything
 * a component may legitimately know about the language set (§9.1).
 *
 * `isSingleLocale` is what makes the locale switcher render nothing and
 * `<TranslatableField />` render as a plain input while English ships alone —
 * both read this rather than testing for a specific language.
 */
export function useLocale(): LocaleState & {
    activeMeta: LocaleMeta | undefined;
    isSingleLocale: boolean;
} {
    const page = usePage().props;

    const defaultLocale = page.defaultLocale ?? i18n.language;
    const locale = page.locale ?? defaultLocale;
    const localeMeta = page.localeMeta ?? {};
    const enabledLocales = page.enabledLocales ?? Object.keys(localeMeta);

    // Client-side navigation between locales is a full Inertia visit, so this
    // only fires when the locale genuinely changed.
    useEffect(() => {
        if (locale && i18n.language !== locale) {
            void i18n.changeLanguage(locale);
        }
    }, [locale]);

    return {
        locale,
        defaultLocale,
        enabledLocales,
        localeMeta,
        activeMeta: localeMeta[locale],
        isSingleLocale: enabledLocales.length <= 1,
    };
}

/**
 * Prefixes an app-relative path with the active locale, mirroring the server's
 * URL strategy (§9.2): the default locale stays unprefixed forever, every
 * other locale gets `/{locale}` in front.
 *
 * Wayfinder generates canonical (default-locale) URLs at build time, so this
 * is what keeps a link inside the app in the language the visitor is reading.
 */
export function useLocalizedUrl(): (path: string) => string {
    const { locale, defaultLocale } = useLocale();

    return useCallback(
        (path: string): string => {
            if (!locale || locale === defaultLocale) {
                return path;
            }

            return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
        },
        [locale, defaultLocale],
    );
}

export type { LocaleCode, LocaleMeta, LocaleState };
