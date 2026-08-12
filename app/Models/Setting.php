<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\SettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Key/value store for the things the client edits without a deploy (§6).
 *
 * @property int $id
 * @property string $key
 * @property mixed $value
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['key', 'value'])]
class Setting extends Model
{
    /** @use HasFactory<SettingFactory> */
    use HasFactory;

    private const string CACHE_KEY = 'settings.all';

    /**
     * Every setting as a key/value map. Cached because the footer, the
     * shipping calculation and the contact block all read settings on
     * essentially every request.
     *
     * Named `values` rather than `all` so it does not shadow Eloquent's
     * `Model::all()`, which has a different signature and return type.
     *
     * @return array<string, mixed>
     */
    public static function values(): array
    {
        /** @var array<string, mixed> */
        return Cache::rememberForever(
            self::CACHE_KEY,
            fn (): array => self::query()->pluck('value', 'key')->all(),
        );
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return self::values()[$key] ?? $default;
    }

    /**
     * The store's currency. Named rather than looked up by string at each call
     * site, because a typo in a key returns the default silently.
     */
    public static function currency(): string
    {
        return (string) self::get('currency', 'JPY');
    }

    /** Flat shipping, in integer minor units like every other amount (§2). */
    public static function shippingFlatRateMinor(): int
    {
        return (int) self::get('shipping_flat_rate_minor', 0);
    }

    /**
     * The subtotal at which shipping becomes free. Zero or absent means the
     * flat rate always applies, which is a valid configuration rather than a
     * missing one.
     */
    public static function freeShippingThresholdMinor(): int
    {
        return (int) self::get('free_shipping_threshold_minor', 0);
    }

    public static function put(string $key, mixed $value): void
    {
        self::query()->updateOrCreate(['key' => $key], ['value' => $value]);

        Cache::forget(self::CACHE_KEY);
    }

    protected static function booted(): void
    {
        // Any write through the admin console invalidates the cache too.
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'json',
        ];
    }
}
