<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Locales
|--------------------------------------------------------------------------
|
| The single source of truth for which languages this application speaks.
| Nothing else — not the header, not an admin form, not a validation rule,
| not a seeder — may hardcode a locale list. Adding a locale to `enabled`
| is the one switch that turns it on end to end.
|
*/

return [

    'default' => 'en',

    'fallback' => 'en',

    /*
     * Enabled locales, in the order they should be offered to the user.
     * v1 ships English only; adding 'ja' here is the whole feature flag.
     */
    'enabled' => ['en'],

    /*
     * Presentation metadata for every locale the application knows how to
     * speak, whether or not it is currently enabled.
     *
     * - label:  what the locale switcher shows
     * - native: the language's own name, used for `lang` titles and a11y
     * - dir:    text direction applied to <html>
     * - font:   'latin' or 'cjk'; 'cjk' makes SetLocale stamp `locale-ja`
     *           on <html> so --font-display resolves to a CJK face (§9.6)
     */
    'meta' => [
        'en' => ['label' => 'EN', 'native' => 'English', 'dir' => 'ltr', 'font' => 'latin'],
        'ja' => ['label' => '日本語', 'native' => '日本語', 'dir' => 'ltr', 'font' => 'cjk'],
    ],

];
