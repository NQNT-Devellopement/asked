<?php

use App\Enums\QuestionStatus;
use App\Enums\TeamRole;
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

test('owner can address the current question and advance', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $current = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'created_at' => now()->subDays(2),
    ]);
    $next = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'created_at' => now()->subDay(),
    ]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
        'current_question_id' => $current->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.address', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect();

    $fresh = $current->fresh();
    expect($fresh->status)->toEqual(QuestionStatus::Addressed);
    expect($fresh->addressed_in_session_id)->toEqual($session->id);
    expect($fresh->addressed_at)->not->toBeNull();
    expect($fresh->answer_source_url)->toBeNull();

    expect($session->fresh()->current_question_id)->toEqual($next->id);
});

test('address with no current question returns 422', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.address', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertStatus(422);
});

test('member without ManageQuestions cannot address', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $current = Question::factory()->approved()->create(['team_id' => $team->id]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $member->id,
        'current_question_id' => $current->id,
    ]);

    $this->actingAs($member)
        ->post(route('stream.address', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertForbidden();
});

test('addressing a session from another team is 404', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $current = Question::factory()->approved()->create(['team_id' => $otherTeam->id]);
    $foreign = StreamSession::factory()->create([
        'team_id' => $otherTeam->id,
        'created_by_user_id' => $owner->id,
        'current_question_id' => $current->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.address', ['current_team' => $team->slug, 'session' => $foreign->id]))
        ->assertNotFound();
});

test('addressing leaves skipped_question_ids unchanged', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $skipped = Question::factory()->approved()->create(['team_id' => $team->id]);
    $current = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'created_at' => now()->subDay(),
    ]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
        'current_question_id' => $current->id,
        'skipped_question_ids' => [$skipped->id],
    ]);

    $this->actingAs($owner)
        ->post(route('stream.address', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect();

    expect($session->fresh()->skipped_question_ids)->toEqual([$skipped->id]);
});
