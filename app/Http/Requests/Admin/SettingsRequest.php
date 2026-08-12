<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The settings form (§8): shipping, contact details and social links.
 *
 * The keys here are the whole allow-list — `SettingController` writes exactly
 * these and nothing else, so a tampered payload cannot invent a setting key.
 */
class SettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Money in integer minor units, like everywhere else (§2).
            'shipping_flat_rate_minor' => ['required', 'integer', 'min:0', 'max:1000000'],
            'free_shipping_threshold_minor' => ['required', 'integer', 'min:0', 'max:100000000'],

            'contact_email' => ['required', 'string', 'email:rfc', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:60'],
            'contact_address' => ['nullable', 'string', 'max:255'],

            'instagram_handle' => ['nullable', 'string', 'max:60'],
            'instagram_url' => ['nullable', 'string', 'url', 'max:255'],
            'facebook_url' => ['nullable', 'string', 'url', 'max:255'],
            'youtube_url' => ['nullable', 'string', 'url', 'max:255'],
        ];
    }
}
