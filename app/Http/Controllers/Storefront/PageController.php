<?php

declare(strict_types=1);

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\ContactRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The static storefront pages (§7.12): About / Our Story, and Contact with its
 * form.
 *
 * Contact details come from the `settings` table so the client changes them in
 * the console rather than through a deploy (§6).
 */
final class PageController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('storefront/pages/about');
    }

    public function contact(): Response
    {
        return Inertia::render('storefront/pages/contact', [
            'contact' => $this->contactDetails(),
        ]);
    }

    /**
     * Records an enquiry.
     *
     * Nothing is emailed yet — no mail transport is configured and a silently
     * failing send would be worse than none. The message is validated and
     * logged; wiring a mailable to this action is one class once the client
     * supplies an inbox.
     *
     * The confirmation the customer sees is interface copy and comes from the
     * client dictionary (§9.3), which is why nothing is flashed here.
     */
    public function storeContact(ContactRequest $request): RedirectResponse
    {
        logger()->info('Contact enquiry', $request->safe()->only([
            'name', 'email', 'subject',
        ]));

        return back();
    }

    /**
     * @return array{email: string, phone: string, address: string, instagram: string}
     */
    private function contactDetails(): array
    {
        return [
            'email' => (string) Setting::get('contact_email', ''),
            'phone' => (string) Setting::get('contact_phone', ''),
            'address' => (string) Setting::get('contact_address', ''),
            'instagram' => (string) Setting::get('instagram_handle', ''),
        ];
    }
}
