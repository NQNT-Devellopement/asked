<?php

use App\Enums\TeamRole;
use App\Models\Question;
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

test('next picks the earliest approved question and sets it as current', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $oldest = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'created_at' => now()->subDays(2),
    ]);
    $newest = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'created_at' => now()->subDay(),
    ]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.next', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect();

    expect($session->fresh()->current_question_id)->toEqual($oldest->id);
    expect($newest->id)->not->toEqual($oldest->id);
});

test('next respects the bound question list', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $list = QuestionList::factory()->create(['team_id' => $team->id]);

    $inList = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'question_list_id' => $list->id,
        'position' => 1,
    ]);
    $outOfList = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'created_at' => now()->subYear(),
    ]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
        'list_id' => $list->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.next', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect();

    expect($session->fresh()->current_question_id)->toEqual($inList->id);
    expect($outOfList->id)->not->toEqual($inList->id);
});

test('next skips already-skipped questions', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $first = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'created_at' => now()->subDays(3),
    ]);
    $second = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'created_at' => now()->subDays(2),
    ]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
        'skipped_question_ids' => [$first->id],
    ]);

    $this->actingAs($owner)
        ->post(route('stream.next', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect();

    expect($session->fresh()->current_question_id)->toEqual($second->id);
});

test('next ignores non-approved questions', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    Question::factory()->create(['team_id' => $team->id]); // pending
    Question::factory()->rejected()->create(['team_id' => $team->id]);
    Question::factory()->answered()->create(['team_id' => $team->id]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.next', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect();

    expect($session->fresh()->current_question_id)->toBeNull();
});

test('skip records the current id and advances', function () {
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
        ->post(route('stream.skip', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect();

    $fresh = $session->fresh();

    expect($fresh->skipped_question_ids)->toContain($current->id);
    expect($fresh->current_question_id)->toEqual($next->id);
});

test('showQuestion sets a specific question as current', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $question = Question::factory()->approved()->create(['team_id' => $team->id]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.show-question', [
            'current_team' => $team->slug,
            'session' => $session->id,
            'question' => $question->id,
        ]))
        ->assertRedirect();

    expect($session->fresh()->current_question_id)->toEqual($question->id);
});

test('showQuestion rejects a question from another team', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $foreign = Question::factory()->approved()->create(['team_id' => $otherTeam->id]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.show-question', [
            'current_team' => $team->slug,
            'session' => $session->id,
            'question' => $foreign->id,
        ]))
        ->assertNotFound();
});

test('hide clears the current question', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $current = Question::factory()->approved()->create(['team_id' => $team->id]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
        'current_question_id' => $current->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.hide', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect();

    expect($session->fresh()->current_question_id)->toBeNull();
});

test('a member without ManageQuestions cannot advance', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $member->id,
    ]);

    $this->actingAs($member)
        ->post(route('stream.next', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertForbidden();
});
