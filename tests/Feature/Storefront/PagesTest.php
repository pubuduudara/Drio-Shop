<?php

declare(strict_types=1);

use App\Models\Setting;
use Inertia\Testing\AssertableInertia;

/**
 * About / Our Story and Contact (§7.12).
 */
it('renders the about page', function (): void {
    $this->get(route('about'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/pages/about'));
});

it('reads contact details from settings rather than from a deploy', function (): void {
    Setting::put('contact_email', 'hello@drio.jp');
    Setting::put('contact_phone', '03-1234-5678');

    $this->get(route('contact'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/pages/contact')
            ->where('contact.email', 'hello@drio.jp')
            ->where('contact.phone', '03-1234-5678')
        );
});

it('accepts a valid enquiry', function (): void {
    $this->post(route('contact.store'), [
        'name' => 'Niroshi',
        'email' => 'niroshi@example.com',
        'subject' => 'Wholesale enquiry',
        'message' => 'We run a restaurant in Tokyo and would like to order in bulk.',
    ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();
});

it('names every field that needs fixing', function (): void {
    $this->post(route('contact.store'), [
        'name' => '',
        'email' => 'not-an-email',
        'subject' => '',
        'message' => 'too short',
    ])->assertSessionHasErrors(['name', 'email', 'subject', 'message']);
});
