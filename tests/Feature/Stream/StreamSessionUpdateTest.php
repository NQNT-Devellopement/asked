<?php

use App\Enums\OverlayPreset;
use App\Enums\TeamRole;
use App\Models\QuestionList;
use App\Models\StreamSession;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('inertia.testing.ensure_pages_exist', false);
});

test('an owner can update a session name, list, and preset', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $list = QuestionList::factory()->create(['team_id' => $team->id]);
    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->patch(route('stream.update', ['current_team' => $team->slug, 'session' => $session->id]), [
            'name' => 'Renamed',
            'list_id' => $list->id,
            'overlay_preset' => OverlayPreset::Quote->value,
        ])
        ->assertRedirect();

    $fresh = $session->fresh();

    expect($fresh->name)->toEqual('Renamed');
    expect($fresh->list_id)->toEqual($list->id);
    expect($fresh->overlay_preset)->toEqual(OverlayPreset::Quote);
});

test('updating with a list from another team is rejected', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $foreignList = QuestionList::factory()->create();

    $this->actingAs($owner)
        ->patch(route('stream.update', ['current_team' => $team->slug, 'session' => $session->id]), [
            'list_id' => $foreignList->id,
        ])
        ->assertStatus(422);
});

test('updating a session from another team yields 404', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $foreign = StreamSession::factory()->create([
        'team_id' => $otherTeam->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->patch(route('stream.update', ['current_team' => $team->slug, 'session' => $foreign->id]), [
            'name' => 'Hijack',
        ])
        ->assertNotFound();
});

test('a member without ManageQuestions cannot update', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $member->id,
    ]);

    $this->actingAs($member)
        ->patch(route('stream.update', ['current_team' => $team->slug, 'session' => $session->id]), [
            'name' => 'Nope',
        ])
        ->assertForbidden();
});
