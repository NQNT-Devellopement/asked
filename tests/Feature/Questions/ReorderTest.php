<?php

use App\Enums\TeamRole;
use App\Models\Question;
use App\Models\QuestionList;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('inertia.testing.ensure_pages_exist', false);
});

test('owners can bulk reorder questions and reassign them to lists', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $list = QuestionList::factory()->create(['team_id' => $team->id]);

    $first = Question::factory()->approved()->create(['team_id' => $team->id, 'position' => 0]);
    $second = Question::factory()->approved()->create(['team_id' => $team->id, 'position' => 1]);

    $this->actingAs($owner)
        ->from(route('questions.board', $team))
        ->post(route('questions.reorder', $team), [
            'items' => [
                ['id' => $first->id, 'list_id' => $list->id, 'position' => 5],
                ['id' => $second->id, 'list_id' => null, 'position' => 9],
            ],
        ])
        ->assertRedirect(route('questions.board', $team));

    expect($first->fresh()->question_list_id)->toEqual($list->id);
    expect($first->fresh()->position)->toEqual(5);
    expect($second->fresh()->question_list_id)->toBeNull();
    expect($second->fresh()->position)->toEqual(9);
});

test('reorder rejects question ids that belong to another team', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $foreign = Question::factory()->approved()->create(['team_id' => $otherTeam->id, 'position' => 0]);

    $this->actingAs($owner)
        ->post(route('questions.reorder', $team), [
            'items' => [
                ['id' => $foreign->id, 'list_id' => null, 'position' => 1],
            ],
        ])
        ->assertStatus(422);

    expect($foreign->fresh()->position)->toEqual(0);
});

test('reorder rejects list ids that belong to another team', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $question = Question::factory()->approved()->create(['team_id' => $team->id]);

    $otherTeam = Team::factory()->create();
    $foreignList = QuestionList::factory()->create(['team_id' => $otherTeam->id]);

    $this->actingAs($owner)
        ->post(route('questions.reorder', $team), [
            'items' => [
                ['id' => $question->id, 'list_id' => $foreignList->id, 'position' => 0],
            ],
        ])
        ->assertStatus(422);

    expect($question->fresh()->question_list_id)->toBeNull();
});

test('reorder is forbidden for members without ManageQuestions', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->post(route('questions.reorder', $team), [
            'items' => [],
        ])
        ->assertForbidden();
});

test('a transaction rolls back when a foreign id is included alongside owned ids', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $owned = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'position' => 0,
    ]);

    $otherTeam = Team::factory()->create();
    $foreign = Question::factory()->approved()->create([
        'team_id' => $otherTeam->id,
        'position' => 0,
    ]);

    $this->actingAs($owner)
        ->post(route('questions.reorder', $team), [
            'items' => [
                ['id' => $owned->id, 'list_id' => null, 'position' => 99],
                ['id' => $foreign->id, 'list_id' => null, 'position' => 99],
            ],
        ])
        ->assertStatus(422);

    expect($owned->fresh()->position)->toEqual(0);
    expect($foreign->fresh()->position)->toEqual(0);
});
