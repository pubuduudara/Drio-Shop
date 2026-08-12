<?php

declare(strict_types=1);

use App\Support\Locales;
use Inertia\Testing\AssertableInertia;

/**
 * Covers the localisation architecture from §9 — specifically the promise that
 * enabling a locale is a config change and nothing else.
 *
 * `withLocales()` lives in tests/Pest.php.
 */
it('serves the default locale without a URL prefix', function (): void {
    $this->get('/tokens')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/design/tokens')
            ->where('locale', 'en')
            ->where('defaultLocale', 'en')
            ->where('enabledLocales', ['en'])
        );
});

it('sets the html lang attribute from the active locale', function (): void {
    $this->get('/tokens')
        ->assertOk()
        ->assertSee('lang="en"', escape: false);
});

it('404s a locale prefix that is not enabled', function (): void {
    $this->get('/ja/tokens')->assertNotFound();
});

it('shares locale metadata sourced from config rather than a hardcoded list', function (): void {
    $this->get('/tokens')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('localeMeta.en.label', 'EN')
            ->where('localeMeta.en.dir', 'ltr')
            ->where('localeMeta.en.font', 'latin')
        );
});

it('resolves a prefixed locale as soon as it is enabled, with no route file change', function (): void {
    withLocales(['en', 'ja']);

    $this->get('/ja/tokens')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('storefront/design/tokens')
            ->where('locale', 'ja')
            ->where('defaultLocale', 'en')
            ->where('enabledLocales', ['en', 'ja'])
        );
});

it('keeps unprefixed English URLs working when a second locale is enabled', function (): void {
    withLocales(['en', 'ja']);

    $this->get('/tokens')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page->where('locale', 'en'));
});

it('stamps the CJK font class on html for a locale that needs it', function (): void {
    withLocales(['en', 'ja']);

    $this->get('/ja/tokens')
        ->assertOk()
        ->assertSee('locale-ja', escape: false)
        ->assertSee('lang="ja"', escape: false);
});

it('names the default locale canonically and namespaces the others', function (): void {
    withLocales(['en', 'ja']);

    expect(route('design.tokens', absolute: false))->toBe('/tokens')
        ->and(route('ja.design.tokens', absolute: false))->toBe('/ja/tokens');
});

describe('the Locales support class', function (): void {
    it('reports a single enabled locale, which is what hides the switcher', function (): void {
        expect(Locales::isSingle())->toBeTrue()
            ->and(Locales::prefixed())->toBe([]);
    });

    it('stops reporting single once a second locale is enabled', function (): void {
        config()->set('locales.enabled', ['en', 'ja']);

        expect(Locales::isSingle())->toBeFalse()
            ->and(Locales::prefixed())->toBe(['ja'])
            ->and(Locales::urlPrefix('en'))->toBe('')
            ->and(Locales::urlPrefix('ja'))->toBe('ja');
    });

    it('falls back to a usable shape for a locale with no metadata', function (): void {
        expect(Locales::meta('si'))->toMatchArray([
            'code' => 'si',
            'label' => 'SI',
            'dir' => 'ltr',
            'font' => 'latin',
        ]);
    });
});

describe('the admin console', function (): void {
    it('is not reachable without authentication', function (): void {
        $this->get('/admin')->assertRedirect('/login');
    });

    it('is not localised by URL', function (): void {
        withLocales(['en', 'ja']);

        $this->get('/ja/admin')->assertNotFound();
    });
});
