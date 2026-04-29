<?php

use App\Enums\QuestionStatus;
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

test('a member without ManageQuestions permission is forbidden', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->get(route('questions.board', $team))
        ->assertForbidden();
});

test('owners see lists ordered by position with their non-rejected questions and unsorted approved questions', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $secondList = QuestionList::factory()->create([
        'team_id' => $team->id,
        'name' => 'Second List',
        'position' => 1,
    ]);

    $firstList = QuestionList::factory()->create([
        'team_id' => $team->id,
        'name' => 'First List',
        'position' => 0,
    ]);

    $approvedInList = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'question_list_id' => $firstList->id,
        'position' => 0,
    ]);

    $rejectedInList = Question::factory()->rejected()->create([
        'team_id' => $team->id,
        'question_list_id' => $firstList->id,
        'position' => 1,
    ]);

    $unsortedApproved = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'question_list_id' => null,
    ]);

    $unsortedAnswered = Question::factory()->answered()->create([
        'team_id' => $team->id,
        'question_list_id' => null,
    ]);

    $unsortedPending = Question::factory()->create([
        'team_id' => $team->id,
        'question_list_id' => null,
        'status' => QuestionStatus::Pending,
    ]);

    $this->actingAs($owner)
        ->get(route('questions.board', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('questions/board')
            ->where('team.slug', $team->slug)
            ->has('lists', 2)
            ->where('lists.0.name', 'First List')
            ->where('lists.1.name', 'Second List')
            ->has('lists.0.questions', 1)
            ->where('lists.0.questions.0.id', $approvedInList->id)
            ->has('unsorted', 2)
            ->where('permissions.canManageQuestions', true)
        );
});

test('cross-team questions never appear on the board', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    Question::factory()->approved()->create(['team_id' => $otherTeam->id]);

    $this->actingAs($owner)
        ->get(route('questions.board', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('lists', 0)
            ->has('unsorted', 0)
        );
});
