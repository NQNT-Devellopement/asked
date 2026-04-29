<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\App;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('inertia.testing.ensure_pages_exist', false);
});

test('a guest can switch locale and gets a cookie back', function () {
    $this->disableCookieEncryption()
        ->patch(route('locale.update'), ['locale' => 'fr'])
        ->assertRedirect()
        ->assertCookie('locale', 'fr', encrypted: false);
});

test('an authenticated user has the locale persisted on their record', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('locale.update'), ['locale' => 'fr'])
        ->assertRedirect();

    expect($user->fresh()->locale)->toEqual('fr');
});

test('an unsupported locale is rejected', function () {
    $this->patch(route('locale.update'), ['locale' => 'jp'])
        ->assertSessionHasErrors('locale');
});

test('the user locale takes priority over the cookie', function () {
    $user = User::factory()->create(['locale' => 'fr']);

    $this->actingAs($user)
        ->disableCookieEncryption()
        ->withCookie('locale', 'en')
        ->get(route('home'));

    expect(App::getLocale())->toEqual('fr');
});

test('the cookie locale is honored for guests', function () {
    $this->disableCookieEncryption()
        ->withCookie('locale', 'fr')
        ->get(route('home'));

    expect(App::getLocale())->toEqual('fr');
});

test('shared inertia props expose the active locale and translations', function () {
    $this->disableCookieEncryption()
        ->withCookie('locale', 'fr')
        ->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->where('locale', 'fr')
            ->where('availableLocales.0.code', 'en')
            ->where('availableLocales.1.code', 'fr')
            ->where('availableLocales.1.label', 'Français')
            ->has('translations')
        );
});

test('the locale switcher is throttled after 60 requests per minute', function () {
    for ($i = 0; $i < 60; $i++) {
        $this->disableCookieEncryption()
            ->patch(route('locale.update'), ['locale' => 'fr'])
            ->assertRedirect();
    }

    $this->disableCookieEncryption()
        ->patch(route('locale.update'), ['locale' => 'fr'])
        ->assertStatus(429);
});

test('translations include accents in french keys', function () {
    $response = $this->disableCookieEncryption()
        ->withCookie('locale', 'fr')
        ->get(route('home'));

    $translations = $response->viewData('page')['props']['translations'];

    expect($translations)
        ->toHaveKey('common.actions.save', 'Enregistrer')
        ->toHaveKey('common.language.switch_label', 'Langue')
        ->toHaveKey('common.state.optional', 'Facultatif')
        ->toHaveKey('common.state.empty', 'Rien à afficher pour l’instant.');
});
