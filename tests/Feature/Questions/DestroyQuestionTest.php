<?php

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

test('an owner can delete a question', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $question = Question::factory()->approved()->create(['team_id' => $team->id]);

    $this->actingAs($owner)
        ->delete(route('questions.destroy', ['current_team' => $team->slug, 'question' => $question->id]))
        ->assertRedirect();

    $this->assertDatabaseMissing('questions', ['id' => $question->id]);
});

test('a member without ManageQuestions cannot delete a question', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $question = Question::factory()->approved()->create(['team_id' => $team->id]);

    $this->actingAs($member)
        ->delete(route('questions.destroy', ['current_team' => $team->slug, 'question' => $question->id]))
        ->assertForbidden();

    $this->assertDatabaseHas('questions', ['id' => $question->id]);
});

test('deleting a question from another team yields 404', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $foreign = Question::factory()->approved()->create(['team_id' => $otherTeam->id]);

    $this->actingAs($owner)
        ->delete(route('questions.destroy', ['current_team' => $team->slug, 'question' => $foreign->id]))
        ->assertNotFound();

    $this->assertDatabaseHas('questions', ['id' => $foreign->id]);
});
