<?php

use App\Models\Question;
use App\Models\StreamSession;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('inertia.testing.ensure_pages_exist', false);
    RateLimiter::clear('overlay-poll');
});

test('the state endpoint returns the canonical JSON shape', function () {
    $team = Team::factory()->create();
    $current = Question::factory()->approved()->create(['team_id' => $team->id]);
    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => User::factory()->create()->id,
        'current_question_id' => $current->id,
    ]);

    $response = $this->getJson(route('overlay.state', ['token' => $session->secret_token]))
        ->assertOk()
        ->assertJsonStructure([
            'preset',
            'team' => ['name', 'slug'],
            'current_question' => ['id', 'body'],
            'version',
        ]);

    expect($response->json('current_question.id'))->toEqual($current->id);
    expect($response->json('team.slug'))->toEqual($team->slug);
    expect($response->json('preset'))->toEqual($session->overlay_preset->value);
});

test('state returns null current_question when none is set', function () {
    $team = Team::factory()->create();
    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => User::factory()->create()->id,
        'current_question_id' => null,
    ]);

    $this->getJson(route('overlay.state', ['token' => $session->secret_token]))
        ->assertOk()
        ->assertJson(['current_question' => null]);
});

test('the state version increments when the current question changes', function () {
    $team = Team::factory()->create();
    $first = Question::factory()->approved()->create(['team_id' => $team->id]);
    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => User::factory()->create()->id,
        'current_question_id' => $first->id,
    ]);

    $initial = $this->getJson(route('overlay.state', ['token' => $session->secret_token]))
        ->json('version');

    $this->travel(2)->seconds();

    $second = Question::factory()->approved()->create(['team_id' => $team->id]);
    $session->update(['current_question_id' => $second->id]);

    $next = $this->getJson(route('overlay.state', ['token' => $session->secret_token]))
        ->json('version');

    expect($next)->toBeGreaterThan($initial);
});

test('the state endpoint is 404 for unknown or inactive tokens', function () {
    $this->getJson(route('overlay.state', ['token' => 'unknown-token']))
        ->assertNotFound();

    $team = Team::factory()->create();
    $inactive = StreamSession::factory()->inactive()->create([
        'team_id' => $team->id,
        'created_by_user_id' => User::factory()->create()->id,
    ]);

    $this->getJson(route('overlay.state', ['token' => $inactive->secret_token]))
        ->assertNotFound();
});

test('the state endpoint is throttled past the limit', function () {
    $team = Team::factory()->create();
    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => User::factory()->create()->id,
    ]);

    for ($i = 0; $i < 600; $i++) {
        $this->getJson(route('overlay.state', ['token' => $session->secret_token]))
            ->assertOk();
    }

    $this->getJson(route('overlay.state', ['token' => $session->secret_token]))
        ->assertStatus(429);
});

test('polling the state endpoint updates last_polled_at', function () {
    $team = Team::factory()->create();
    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => User::factory()->create()->id,
        'last_polled_at' => null,
    ]);

    $this->getJson(route('overlay.state', ['token' => $session->secret_token]))
        ->assertOk();

    expect($session->fresh()->last_polled_at)->not->toBeNull();
});
