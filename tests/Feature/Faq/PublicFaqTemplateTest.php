<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('inertia.testing.ensure_pages_exist', false);
});

test('a freshly created team exposes default template and theme on the public page', function () {
    $team = Team::factory()->create(['name' => 'Acme', 'slug' => 'acme']);

    $this->get(route('faq.show', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('faq/show')
            ->where('team.slug', 'acme')
            ->where('team.template', 'minimal')
            ->where('team.theme.accent', '#d97706')
            ->where('team.theme.background', 'cream')
        );
});

test('the public page reflects a customized template and theme', function () {
    $team = Team::factory()->create([
        'template' => 'timeline',
        'theme' => ['accent' => '#123abc', 'background' => 'noir'],
    ]);

    $this->get(route('faq.show', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('team.template', 'timeline')
            ->where('team.theme.accent', '#123abc')
            ->where('team.theme.background', 'noir')
        );
});

test('a partial theme is merged with defaults', function () {
    $team = Team::factory()->create([
        'theme' => ['accent' => '#000000'],
    ]);

    $this->get(route('faq.show', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('team.theme.accent', '#000000')
            ->where('team.theme.background', 'cream')
        );
});
