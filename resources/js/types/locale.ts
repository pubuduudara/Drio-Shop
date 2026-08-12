/**
 * Locale shapes shared from `config/locales.php` via the SetLocale middleware.
 *
 * These are the only way a component learns which languages exist (§9.1) — no
 * component may carry its own list.
 */

export type LocaleCode = string;

export type LocaleMeta = {
    code: LocaleCode;
    /** What the locale switcher shows, e.g. `EN`. */
    label: string;
    /** The language's own name, e.g. `English`. */
    native: string;
    dir: 'ltr' | 'rtl';
    /** `cjk` locales resolve `--font-display` to a CJK-capable face (§9.6). */
    font: 'latin' | 'cjk';
};

export type LocaleState = {
    locale: LocaleCode;
    defaultLocale: LocaleCode;
    enabledLocales: LocaleCode[];
    localeMeta: Record<LocaleCode, LocaleMeta>;
};
