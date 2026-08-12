import i18n from 'i18next';
import type { Resource, ResourceLanguage } from 'i18next';
import { initReactI18next } from 'react-i18next';

/**
 * Client-side dictionaries (§9.3).
 *
 * Namespaces are discovered from the filesystem rather than declared, so a new
 * locale is a new folder under `resources/js/locales/` and nothing else — no
 * import list to extend, no registry to remember. That is the same property
 * `config/locales.php` gives the server side.
 */
const dictionaries = import.meta.glob<Record<string, unknown>>(
    '../locales/*/*.json',
    { eager: true, import: 'default' },
);

const DICTIONARY_PATH = /\/locales\/([^/]+)\/([^/]+)\.json$/;

function buildResources(): Resource {
    const resources: Resource = {};

    for (const [path, dictionary] of Object.entries(dictionaries)) {
        const match = DICTIONARY_PATH.exec(path);

        if (!match) {
            continue;
        }

        const [, locale, namespace] = match;
        const bundle: ResourceLanguage = resources[locale] ?? {};

        bundle[namespace] = dictionary;
        resources[locale] = bundle;
    }

    return resources;
}

/**
 * The active and fallback locales as the server resolved them. Reading the
 * page payload Inertia already embedded means i18next is configured before the
 * first render, so no string ever flashes in the wrong language.
 */
function readServerLocales(): { locale?: string; fallback?: string } {
    if (typeof document === 'undefined') {
        return {};
    }

    const payload = document.querySelector('script[data-page]')?.textContent;

    if (!payload) {
        return {};
    }

    try {
        const page: unknown = JSON.parse(payload);
        const props =
            typeof page === 'object' && page !== null && 'props' in page
                ? (page as { props: Record<string, unknown> }).props
                : {};

        return {
            locale: typeof props.locale === 'string' ? props.locale : undefined,
            fallback:
                typeof props.defaultLocale === 'string'
                    ? props.defaultLocale
                    : undefined,
        };
    } catch {
        return {};
    }
}

const resources = buildResources();
const server = readServerLocales();

/*
 * Resolution order, none of it a hardcoded language code: the locale the
 * server resolved, then the `lang` the root template stamped, then whichever
 * dictionary folders actually exist on disk.
 */
const documentLocale =
    typeof document !== 'undefined' ? document.documentElement.lang : '';
const [firstBundledLocale] = Object.keys(resources);

const locale = server.locale || documentLocale || firstBundledLocale;
const fallbackLocale = server.fallback || firstBundledLocale || locale;

void i18n.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: fallbackLocale,
    defaultNS: 'common',
    ns: Object.keys(resources[locale] ?? resources[fallbackLocale] ?? {}),
    interpolation: {
        // React escapes for us; double-escaping mangles `&` in copy.
        escapeValue: false,
    },
    returnNull: false,
});

export default i18n;
