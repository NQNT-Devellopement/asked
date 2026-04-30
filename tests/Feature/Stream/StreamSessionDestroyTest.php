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

test('an owner can soft-delete a session', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->delete(route('stream.destroy', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect(route('stream.index', ['current_team' => $team->slug]));

    expect(StreamSession::find($session->id))->toBeNull();
    expect(StreamSession::withTrashed()->find($session->id))->not->toBeNull();
});

test('destroying a session from another team yields 404', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $foreign = StreamSession::factory()->create([
        'team_id' => $otherTeam->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->delete(route('stream.destroy', ['current_team' => $team->slug, 'session' => $foreign->id]))
        ->assertNotFound();
});

test('a member without ManageQuestions cannot destroy a session', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $member->id,
    ]);

    $this->actingAs($member)
        ->delete(route('stream.destroy', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertForbidden();
});
