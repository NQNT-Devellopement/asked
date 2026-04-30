<?php

use App\Enums\AnswerSourcePlatform;
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

test('answer marks the current question as answered and advances', function () {
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
        ->post(route('stream.answer', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'source_label' => 'My answer',
        ])
        ->assertRedirect();

    $freshQuestion = $current->fresh();
    expect($freshQuestion->status)->toEqual(QuestionStatus::Answered);
    expect($freshQuestion->answer_source_url)->toEqual('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect($freshQuestion->answer_source_type)->toEqual(AnswerSourcePlatform::YouTube);
    expect($freshQuestion->answer_source_label)->toEqual('My answer');
    expect($freshQuestion->answered_at)->not->toBeNull();

    expect($session->fresh()->current_question_id)->toEqual($next->id);
});

test('answer with no current question is 422', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.answer', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ])
        ->assertStatus(422);
});

test('answer requires a valid url', function () {
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
        ->post(route('stream.answer', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => 'not-a-url',
        ])
        ->assertSessionHasErrors('source_url');
});

test('a member without ManageQuestions cannot answer', function () {
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
        ->post(route('stream.answer', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ])
        ->assertForbidden();
});
