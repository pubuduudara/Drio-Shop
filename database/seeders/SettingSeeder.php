<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

/**
 * Defaults for the things the client edits without a deploy (§6, §8).
 *
 * Money here is integer minor units like everywhere else — ¥600 flat shipping,
 * free over ¥5,000.
 */
class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'shipping_flat_rate_minor' => 600,
            'free_shipping_threshold_minor' => 5000,
            'currency' => 'JPY',
            'contact_email' => 'hello@drio.jp',
            'contact_phone' => '03-1234-5678',
            'contact_address' => 'Shibuya, Tokyo, Japan',
            'instagram_handle' => '@drio.srilankanflavours',
            'instagram_url' => 'https://instagram.com/drio.srilankanflavours',
            'facebook_url' => 'https://facebook.com/drio.srilankanflavours',
            'youtube_url' => 'https://youtube.com/@drio.srilankanflavours',
        ];

        foreach ($settings as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
