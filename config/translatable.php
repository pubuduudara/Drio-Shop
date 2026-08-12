<?php

declare(strict_types=1);

use App\Support\Locales;

/*
|--------------------------------------------------------------------------
| Translatable
|--------------------------------------------------------------------------
|
| Spatie Translatable's fallback behaviour, sourced from config/locales.php so
| there is still exactly one place that names a locale (§9.1).
|
| `fallback_any` matters more than it looks: a record with no value in the
| active locale renders its English value rather than an empty string, which
| is what keeps a half-translated catalogue rendering complete pages (§9.4).
|
*/

return [

    'fallback_locale' => Locales::fallback(),

    'fallback_any' => true,

];
