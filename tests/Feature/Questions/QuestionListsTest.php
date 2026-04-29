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

test('owners can create a question list with auto-incrementing position', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    QuestionList::factory()->create(['team_id' => $team->id, 'position' => 0]);
    QuestionList::factory()->create(['team_id' => $team->id, 'position' => 1]);

    $this->actingAs($owner)
        ->post(route('questions.lists.store', $team), [
            'name' => 'Big Questions',
            'color' => '#ff00ff',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('question_lists', [
        'team_id' => $team->id,
        'name' => 'Big Questions',
        'color' => '#ff00ff',
        'position' => 2,
    ]);
});

test('store validates name and color', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $this->actingAs($owner)
        ->post(route('questions.lists.store', $team), [
            'name' => '',
            'color' => 'not-a-color',
        ])
        ->assertSessionHasErrors(['name', 'color']);
});

test('a member without ManageQuestions cannot create a list', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->post(route('questions.lists.store', $team), [
            'name' => 'New List',
        ])
        ->assertForbidden();
});

test('owners can update a question list', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $list = QuestionList::factory()->create([
        'team_id' => $team->id,
        'name' => 'Old Name',
        'color' => '#000000',
    ]);

    $this->actingAs($owner)
        ->patch(route('questions.lists.update', ['current_team' => $team->slug, 'list' => $list->id]), [
            'name' => 'Renamed',
            'color' => '#abcdef',
        ])
        ->assertRedirect();

    $fresh = $list->fresh();
    expect($fresh->name)->toEqual('Renamed');
    expect($fresh->color)->toEqual('#abcdef');
});

test('updating a list belonging to another team yields 404', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $foreignList = QuestionList::factory()->create(['team_id' => $otherTeam->id]);

    $this->actingAs($owner)
        ->patch(route('questions.lists.update', ['current_team' => $team->slug, 'list' => $foreignList->id]), [
            'name' => 'Hijacked',
        ])
        ->assertNotFound();

    expect($foreignList->fresh()->name)->not->toEqual('Hijacked');
});

test('deleting a list nulls its questions question_list_id but keeps the questions', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $list = QuestionList::factory()->create(['team_id' => $team->id]);

    $question = Question::factory()->approved()->create([
        'team_id' => $team->id,
        'question_list_id' => $list->id,
    ]);

    $this->actingAs($owner)
        ->delete(route('questions.lists.destroy', ['current_team' => $team->slug, 'list' => $list->id]))
        ->assertRedirect();

    $this->assertDatabaseMissing('question_lists', ['id' => $list->id]);
    $this->assertDatabaseHas('questions', [
        'id' => $question->id,
        'question_list_id' => null,
    ]);
});

test('owners can reorder question lists', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $a = QuestionList::factory()->create(['team_id' => $team->id, 'position' => 0]);
    $b = QuestionList::factory()->create(['team_id' => $team->id, 'position' => 1]);
    $c = QuestionList::factory()->create(['team_id' => $team->id, 'position' => 2]);

    $this->actingAs($owner)
        ->from(route('questions.board', $team))
        ->post(route('questions.lists.reorder', $team), [
            'ids' => [$c->id, $a->id, $b->id],
        ])
        ->assertRedirect(route('questions.board', $team));

    expect($c->fresh()->position)->toEqual(0);
    expect($a->fresh()->position)->toEqual(1);
    expect($b->fresh()->position)->toEqual(2);
});

test('reordering rejects list ids from another team', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $list = QuestionList::factory()->create(['team_id' => $team->id, 'position' => 0]);

    $otherTeam = Team::factory()->create();
    $foreignList = QuestionList::factory()->create(['team_id' => $otherTeam->id, 'position' => 0]);

    $this->actingAs($owner)
        ->post(route('questions.lists.reorder', $team), [
            'ids' => [$list->id, $foreignList->id],
        ])
        ->assertStatus(422);

    expect($list->fresh()->position)->toEqual(0);
    expect($foreignList->fresh()->position)->toEqual(0);
});
