<?php

use App\Models\Question;
use App\Models\StreamSession;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('inertia.testing.ensure_pages_exist', false);
});

test('the public overlay loads by token without auth', function () {
    $team = Team::factory()->create();
    $current = Question::factory()->approved()->create(['team_id' => $team->id]);
    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => User::factory()->create()->id,
        'current_question_id' => $current->id,
    ]);

    $this->get(route('overlay.show', ['token' => $session->secret_token]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('overlay/show')
            ->where('preset', $session->overlay_preset->value)
            ->where('team.slug', $team->slug)
            ->where('state.current_question.id', $current->id)
            ->has('state.version')
        );
});

test('the public overlay returns 404 for an unknown token', function () {
    $this->get(route('overlay.show', ['token' => 'nope-not-real']))
        ->assertNotFound();
});

test('the public overlay returns 404 for an inactive session', function () {
    $team = Team::factory()->create();
    $session = StreamSession::factory()->inactive()->create([
        'team_id' => $team->id,
        'created_by_user_id' => User::factory()->create()->id,
    ]);

    $this->get(route('overlay.show', ['token' => $session->secret_token]))
        ->assertNotFound();
});

test('viewing the overlay updates last_polled_at', function () {
    $team = Team::factory()->create();
    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => User::factory()->create()->id,
        'last_polled_at' => null,
    ]);

    expect($session->last_polled_at)->toBeNull();

    $this->get(route('overlay.show', ['token' => $session->secret_token]))
        ->assertOk();

    expect($session->fresh()->last_polled_at)->not->toBeNull();
});
