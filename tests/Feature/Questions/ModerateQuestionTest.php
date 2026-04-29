<?php

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

test('an owner can approve a pending question', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $question = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Pending,
    ]);

    $this->actingAs($owner)
        ->patch(route('questions.moderate', ['current_team' => $team->slug, 'question' => $question->id]), [
            'decision' => 'approve',
        ])
        ->assertRedirect();

    expect($question->fresh()->status)->toEqual(QuestionStatus::Approved);
});

test('an owner can reject a pending question', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $question = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Pending,
    ]);

    $this->actingAs($owner)
        ->patch(route('questions.moderate', ['current_team' => $team->slug, 'question' => $question->id]), [
            'decision' => 'reject',
        ])
        ->assertRedirect();

    expect($question->fresh()->status)->toEqual(QuestionStatus::Rejected);
});

test('a member without ModerateQuestions cannot moderate', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $question = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Pending,
    ]);

    $this->actingAs($member)
        ->patch(route('questions.moderate', ['current_team' => $team->slug, 'question' => $question->id]), [
            'decision' => 'approve',
        ])
        ->assertForbidden();

    expect($question->fresh()->status)->toEqual(QuestionStatus::Pending);
});

test('moderating a question from another team yields 404', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $foreignQuestion = Question::factory()->create([
        'team_id' => $otherTeam->id,
        'status' => QuestionStatus::Pending,
    ]);

    $this->actingAs($owner)
        ->patch(route('questions.moderate', ['current_team' => $team->slug, 'question' => $foreignQuestion->id]), [
            'decision' => 'approve',
        ])
        ->assertNotFound();

    expect($foreignQuestion->fresh()->status)->toEqual(QuestionStatus::Pending);
});

test('an invalid decision is rejected by validation', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $question = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Pending,
    ]);

    $this->actingAs($owner)
        ->patch(route('questions.moderate', ['current_team' => $team->slug, 'question' => $question->id]), [
            'decision' => 'maybe',
        ])
        ->assertSessionHasErrors('decision');
});
