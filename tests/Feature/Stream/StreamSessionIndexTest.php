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

test('guests are redirected from the stream index', function () {
    $team = Team::factory()->create();

    $this->get(route('stream.index', ['current_team' => $team->slug]))
        ->assertRedirect(route('login'));
});

test('a member without ManageQuestions cannot view the stream index', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->get(route('stream.index', ['current_team' => $team->slug]))
        ->assertForbidden();
});

test('an owner sees their team sessions on the index', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    StreamSession::factory()->count(2)->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $otherTeam = Team::factory()->create();
    StreamSession::factory()->create([
        'team_id' => $otherTeam->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->get(route('stream.index', ['current_team' => $team->slug]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('stream/index')
            ->has('sessions', 2)
            ->where('permissions.canManage', true)
        );
});
