<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingsRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Store settings (§8): shipping rate, free-shipping threshold, contact details
 * and social links.
 *
 * Only the keys `SettingsRequest` validates are written. The settings table is
 * a key/value store, so without that allow-list a tampered payload could
 * invent keys — or overwrite `currency`, which is not editable here because
 * changing it would reinterpret every price already stored.
 */
final class SettingController extends Controller
{
    public function edit(): Response
    {
        $stored = Setting::values();

        return Inertia::render('admin/settings/index', [
            'settings' => [
                'shipping_flat_rate_minor' => (int) ($stored['shipping_flat_rate_minor'] ?? 0),
                'free_shipping_threshold_minor' => (int) ($stored['free_shipping_threshold_minor'] ?? 0),
                'contact_email' => (string) ($stored['contact_email'] ?? ''),
                'contact_phone' => (string) ($stored['contact_phone'] ?? ''),
                'contact_address' => (string) ($stored['contact_address'] ?? ''),
                'instagram_handle' => (string) ($stored['instagram_handle'] ?? ''),
                'instagram_url' => (string) ($stored['instagram_url'] ?? ''),
                'facebook_url' => (string) ($stored['facebook_url'] ?? ''),
                'youtube_url' => (string) ($stored['youtube_url'] ?? ''),
            ],
            'currency' => Setting::currency(),
        ]);
    }

    public function update(SettingsRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            Setting::put($key, $value);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('admin.toast.saved')]);

        return back();
    }
}
