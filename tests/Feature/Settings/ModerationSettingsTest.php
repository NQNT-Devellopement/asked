<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Config::set('inertia.testing.ensure_pages_exist', false);
});

/**
 * @return array{0: Team, 1: User}
 */
function makeTeamWithMember(TeamRole $role): array
{
    $team = Team::factory()->create();
    $user = User::factory()->create();
    $team->members()->attach($user->id, ['role' => $role->value]);

    return [$team, $user];
}

test('owner can view the moderation page', function () {
    [$team, $user] = makeTeamWithMember(TeamRole::Owner);

    $response = $this->actingAs($user)
        ->get(route('teams.moderation.edit', $team));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('settings/moderation')
        ->where('team.slug', $team->slug)
        ->has('bannedWords')
    );
});

test('admin can update the banned words list', function () {
    [$team, $user] = makeTeamWithMember(TeamRole::Admin);

    $response = $this->actingAs($user)
        ->put(route('teams.moderation.update', $team), [
            'words' => ['  Foo ', 'BAR', 'foo'], // duplicate after normalization
        ]);

    $response->assertRedirect();

    $team->refresh();
    expect($team->banned_words)
        ->toBeArray()
        ->and($team->banned_words)->toContain('foo')
        ->and($team->banned_words)->toContain('bar')
        ->and(count($team->banned_words))->toBe(2); // dedup happened
});

test('member cannot view or update the moderation page', function () {
    [$team, $user] = makeTeamWithMember(TeamRole::Member);

    $this->actingAs($user)
        ->get(route('teams.moderation.edit', $team))
        ->assertForbidden();

    $this->actingAs($user)
        ->put(route('teams.moderation.update', $team), ['words' => ['xx']])
        ->assertForbidden();
});

test('non-member cannot access the moderation page', function () {
    $team = Team::factory()->create();
    $stranger = User::factory()->create();

    $this->actingAs($stranger)
        ->get(route('teams.moderation.edit', $team))
        ->assertForbidden();
});

test('updating busts the public faq cache', function () {
    [$team, $user] = makeTeamWithMember(TeamRole::Owner);

    Cache::put("team:{$team->id}:public-faq", ['stale' => true], 60);

    $this->actingAs($user)
        ->put(route('teams.moderation.update', $team), ['words' => ['blorp']])
        ->assertRedirect();

    expect(Cache::get("team:{$team->id}:public-faq"))->toBeNull();
});

test('it rejects words shorter than 2 characters', function () {
    [$team, $user] = makeTeamWithMember(TeamRole::Owner);

    $response = $this->actingAs($user)
        ->put(route('teams.moderation.update', $team), ['words' => ['a']]);

    $response->assertSessionHasErrors('words.0');
});

test('it caps the list at 200 entries', function () {
    [$team, $user] = makeTeamWithMember(TeamRole::Owner);

    $words = collect(range(1, 201))->map(fn (int $i): string => "word{$i}")->all();

    $response = $this->actingAs($user)
        ->put(route('teams.moderation.update', $team), ['words' => $words]);

    $response->assertSessionHasErrors('words');
});
