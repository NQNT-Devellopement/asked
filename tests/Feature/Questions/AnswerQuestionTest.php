<?php

use App\Enums\AnswerSourcePlatform;
use App\Enums\QuestionStatus;
use App\Enums\TeamRole;
use App\Models\Question;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('inertia.testing.ensure_pages_exist', false);
});

test('an owner can mark a question as answered with a YouTube URL', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $question = Question::factory()->approved()->create(['team_id' => $team->id]);

    $this->actingAs($owner)
        ->patch(route('questions.answer', ['current_team' => $team->slug, 'question' => $question->id]), [
            'source_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'source_label' => 'My answer',
        ])
        ->assertRedirect();

    $fresh = $question->fresh();

    expect($fresh->status)->toEqual(QuestionStatus::Answered);
    expect($fresh->answer_source_url)->toEqual('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect($fresh->answer_source_label)->toEqual('My answer');
    expect($fresh->answer_source_type)->toEqual(AnswerSourcePlatform::YouTube);
    expect($fresh->answered_at)->not->toBeNull();
});

test('answering requires a valid url', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $question = Question::factory()->approved()->create(['team_id' => $team->id]);

    $this->actingAs($owner)
        ->patch(route('questions.answer', ['current_team' => $team->slug, 'question' => $question->id]), [
            'source_url' => 'not-a-url',
        ])
        ->assertSessionHasErrors('source_url');
});

test('a member without ManageQuestions cannot answer', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $question = Question::factory()->approved()->create(['team_id' => $team->id]);

    $this->actingAs($member)
        ->patch(route('questions.answer', ['current_team' => $team->slug, 'question' => $question->id]), [
            'source_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ])
        ->assertForbidden();
});

test('unanswering reverts an answered question to approved and clears answer fields', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $question = Question::factory()->answered()->create(['team_id' => $team->id]);

    $this->actingAs($owner)
        ->delete(route('questions.unanswer', ['current_team' => $team->slug, 'question' => $question->id]))
        ->assertRedirect();

    $fresh = $question->fresh();

    expect($fresh->status)->toEqual(QuestionStatus::Approved);
    expect($fresh->answer_source_url)->toBeNull();
    expect($fresh->answer_source_label)->toBeNull();
    expect($fresh->answer_source_type)->toBeNull();
    expect($fresh->answered_at)->toBeNull();
});

test('unanswering a non-answered question is 404', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $question = Question::factory()->approved()->create(['team_id' => $team->id]);

    $this->actingAs($owner)
        ->delete(route('questions.unanswer', ['current_team' => $team->slug, 'question' => $question->id]))
        ->assertNotFound();
});

test('answering a question from another team yields 404', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $foreignQuestion = Question::factory()->approved()->create(['team_id' => $otherTeam->id]);

    $this->actingAs($owner)
        ->patch(route('questions.answer', ['current_team' => $team->slug, 'question' => $foreignQuestion->id]), [
            'source_url' => 'https://www.youtube.com/watch?v=test',
        ])
        ->assertNotFound();
});
