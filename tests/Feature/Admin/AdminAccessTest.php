<?php

declare(strict_types=1);

use App\Models\User;
use Laravel\Fortify\Features;

/**
 * Who may reach the console, and how they get in (§8).
 */
it('redirects a guest to the login page', function (): void {
    $this->get('/admin')->assertRedirect(route('login'));
});

it('refuses a signed-in user who is not an admin', function (): void {
    $this->actingAs(User::factory()->create(['is_admin' => false]))
        ->get('/admin')
        ->assertForbidden();
});

it('lets an admin in', function (): void {
    $this->actingAs(User::factory()->create(['is_admin' => true]))
        ->get('/admin')
        ->assertOk();
});

it('has no public registration route', function (): void {
    expect(Features::enabled(Features::registration()))->toBeFalse()
        ->and(app('router')->getRoutes()->hasNamedRoute('register'))->toBeFalse();
});

it('sends an admin to the console after logging in', function (): void {
    $admin = User::factory()->create([
        'email' => 'admin@drio.jp',
        'password' => 'password',
        'is_admin' => true,
    ]);

    $this->post(route('login.store'), [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect(route('admin.dashboard', absolute: false));

    $this->assertAuthenticatedAs($admin);
});

it('throttles repeated failed logins', function (): void {
    $admin = User::factory()->create(['email' => 'admin@drio.jp']);

    foreach (range(1, 5) as $ignored) {
        $this->post(route('login.store'), [
            'email' => $admin->email,
            'password' => 'wrong-password',
        ]);
    }

    // The sixth attempt never reaches the credentials check: the `login`
    // limiter (5/minute, keyed on email + IP) rejects it outright.
    $this->post(route('login.store'), [
        'email' => $admin->email,
        'password' => 'wrong-password',
    ])->assertTooManyRequests();

    $this->assertGuest();
});

it('invalidates the session on sign out', function (): void {
    $this->actingAs(User::factory()->create(['is_admin' => true]))
        ->post(route('logout'))
        ->assertRedirect();

    $this->assertGuest();
});
