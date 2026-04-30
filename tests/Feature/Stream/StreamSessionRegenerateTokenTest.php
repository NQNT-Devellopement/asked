<?php

use App\Enums\TeamRole;
use App\Models\StreamSession;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('inertia.testing.ensure_pages_exist', false);
});

test('an owner can regenerate a session token', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $oldToken = $session->secret_token;

    $this->actingAs($owner)
        ->post(route('stream.regenerate-token', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect();

    $fresh = $session->fresh();
    expect($fresh->secret_token)->not->toEqual($oldToken);
    expect(strlen((string) $fresh->secret_token))->toEqual(64);
});

test('the old token returns 404 on the public overlay route after regeneration', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $oldToken = $session->secret_token;

    $this->actingAs($owner)
        ->post(route('stream.regenerate-token', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect();

    $this->get(route('overlay.show', ['token' => $oldToken]))
        ->assertNotFound();

    $this->get(route('overlay.show', ['token' => $session->fresh()->secret_token]))
        ->assertOk();
});

test('a member without ManageQuestions cannot regenerate the token', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $member->id,
    ]);

    $this->actingAs($member)
        ->post(route('stream.regenerate-token', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertForbidden();
});
