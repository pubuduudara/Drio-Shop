<?php

declare(strict_types=1);

namespace App\Support;

/**
 * The only class permitted to read `config/locales.php`.
 *
 * Everything that needs to know which languages exist — middleware, route
 * registration, Inertia props, admin validation, seeders — goes through here,
 * so enabling a locale stays a one-line config change (§9.1).
 *
 * @phpstan-type LocaleMeta array{code: string, label: string, native: string, dir: string, font: string}
 */
final class Locales
{
    public static function default(): string
    {
        return (string) config('locales.default', 'en');
    }

    public static function fallback(): string
    {
        return (string) config('locales.fallback', self::default());
    }

    /**
     * Enabled locale codes, in the order they should be offered to the user.
     *
     * @return list<string>
     */
    public static function enabled(): array
    {
        /** @var list<string> $enabled */
        $enabled = array_values(array_filter((array) config('locales.enabled', [])));

        return $enabled === [] ? [self::default()] : $enabled;
    }

    /**
     * Enabled locales other than the default — the ones that carry a URL prefix.
     *
     * @return list<string>
     */
    public static function prefixed(): array
    {
        return array_values(array_diff(self::enabled(), [self::default()]));
    }

    public static function isEnabled(string $locale): bool
    {
        return in_array($locale, self::enabled(), true);
    }

    /**
     * True while only one locale is live, which is what tells the locale
     * switcher to render nothing (§7.1) and `<TranslatableField />` to render
     * as an ordinary input (§9.5).
     */
    public static function isSingle(): bool
    {
        return count(self::enabled()) === 1;
    }

    /**
     * Presentation metadata for one locale, falling back to a usable shape for
     * a locale that has no `meta` entry.
     *
     * @return LocaleMeta
     */
    public static function meta(string $locale): array
    {
        /** @var array{label?: string, native?: string, dir?: string, font?: string} $meta */
        $meta = (array) config("locales.meta.{$locale}", []);

        return [
            'code' => $locale,
            'label' => $meta['label'] ?? strtoupper($locale),
            'native' => $meta['native'] ?? strtoupper($locale),
            'dir' => $meta['dir'] ?? 'ltr',
            'font' => $meta['font'] ?? 'latin',
        ];
    }

    /**
     * Metadata for every enabled locale, keyed by code — the shape shared with
     * the front end so no component ever hardcodes a language list.
     *
     * @return array<string, LocaleMeta>
     */
    public static function enabledMeta(): array
    {
        $meta = [];

        foreach (self::enabled() as $locale) {
            $meta[$locale] = self::meta($locale);
        }

        return $meta;
    }

    /**
     * The URL prefix for a locale: empty for the default locale, so English
     * URLs stay unprefixed forever (§9.2).
     */
    public static function urlPrefix(string $locale): string
    {
        return $locale === self::default() ? '' : $locale;
    }

    /**
     * The route-name prefix for a locale, mirroring `urlPrefix`. The default
     * locale owns the canonical names (`shop`), others are namespaced
     * (`ja.shop`).
     */
    public static function routeNamePrefix(string $locale): string
    {
        return $locale === self::default() ? '' : $locale.'.';
    }
}
