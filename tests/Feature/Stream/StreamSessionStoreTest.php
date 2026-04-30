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

test('an owner can create a stream session', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $response = $this->actingAs($owner)
        ->post(route('stream.store', ['current_team' => $team->slug]), [
            'name' => 'Friday AMA',
            'list_id' => null,
            'overlay_preset' => OverlayPreset::Editorial->value,
        ]);

    $session = StreamSession::query()->first();

    expect($session)->not->toBeNull();
    expect($session->name)->toEqual('Friday AMA');
    expect($session->team_id)->toEqual($team->id);
    expect($session->created_by_user_id)->toEqual($owner->id);
    expect(strlen((string) $session->secret_token))->toEqual(64);
    expect($session->is_active)->toBeTrue();
    expect($session->skipped_question_ids)->toEqual([]);

    $response->assertRedirect(route('stream.show', [
        'current_team' => $team->slug,
        'session' => $session->id,
    ]));
});

test('the secret token is unique across sessions', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)->post(route('stream.store', ['current_team' => $team->slug]), [
        'name' => 'A',
        'overlay_preset' => OverlayPreset::Editorial->value,
    ]);
    $this->actingAs($owner)->post(route('stream.store', ['current_team' => $team->slug]), [
        'name' => 'B',
        'overlay_preset' => OverlayPreset::Editorial->value,
    ]);

    $tokens = StreamSession::query()->pluck('secret_token')->all();

    expect(count($tokens))->toEqual(2);
    expect(count(array_unique($tokens)))->toEqual(2);
});

test('a list_id from another team is rejected', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $foreignList = QuestionList::factory()->create();

    $this->actingAs($owner)
        ->post(route('stream.store', ['current_team' => $team->slug]), [
            'name' => 'Bad list',
            'list_id' => $foreignList->id,
            'overlay_preset' => OverlayPreset::Editorial->value,
        ])
        ->assertStatus(422);

    expect(StreamSession::query()->count())->toEqual(0);
});

test('an invalid overlay preset is rejected', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->post(route('stream.store', ['current_team' => $team->slug]), [
            'name' => 'Bad preset',
            'overlay_preset' => 'not-a-real-preset',
        ])
        ->assertSessionHasErrors('overlay_preset');
});

test('a member without ManageQuestions cannot create a session', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->post(route('stream.store', ['current_team' => $team->slug]), [
            'name' => 'No perm',
            'overlay_preset' => OverlayPreset::Editorial->value,
        ])
        ->assertForbidden();
});
