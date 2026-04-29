<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the team owner cannot be demoted via the update endpoint', function () {
    $owner = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $response = $this
        ->actingAs($owner)
        ->patch(route('teams.members.update', [$team, $owner]), [
            'role' => TeamRole::Admin->value,
        ]);

    $response->assertForbidden();

    expect($team->members()->where('user_id', $owner->id)->first()->pivot->role->value)
        ->toEqual(TeamRole::Owner->value);
});

test('owners can update other members roles', function () {
    $owner = User::factory()->create();
    $member = User::factory()->create();
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $response = $this
        ->actingAs($owner)
        ->patch(route('teams.members.update', [$team, $member]), [
            'role' => TeamRole::Admin->value,
        ]);

    $response->assertRedirect(route('teams.edit', $team));

    expect($team->members()->where('user_id', $member->id)->first()->pivot->role->value)
        ->toEqual(TeamRole::Admin->value);
});
