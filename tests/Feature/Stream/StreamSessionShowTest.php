<?php

use App\Enums\QuestionStatus;
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

test('the control panel renders with session, queue, and lists', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $list = QuestionList::factory()->create(['team_id' => $team->id]);
    $current = Question::factory()->approved()->create(['team_id' => $team->id]);

    Question::factory()->approved()->count(3)->create(['team_id' => $team->id]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
        'current_question_id' => $current->id,
    ]);

    $this->actingAs($owner)
        ->get(route('stream.show', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('stream/show')
            ->where('session.id', $session->id)
            ->where('session.current_question.id', $current->id)
            ->has('queue', 3)
            ->has('lists', 1)
            ->where('lists.0.id', $list->id)
            ->where('permissions.canManage', true)
        );
});

test('a session from another team is 404', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $foreign = StreamSession::factory()->create([
        'team_id' => $otherTeam->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->get(route('stream.show', ['current_team' => $team->slug, 'session' => $foreign->id]))
        ->assertNotFound();
});

test('the control panel exposes addressed questions ordered by addressed_at desc', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $older = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Addressed,
        'addressed_in_session_id' => $session->id,
        'addressed_at' => now()->subMinutes(10),
    ]);
    $newer = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Addressed,
        'addressed_in_session_id' => $session->id,
        'addressed_at' => now()->subMinute(),
    ]);

    $this->actingAs($owner)
        ->get(route('stream.show', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('stream/show')
            ->has('addressed', 2)
            ->where('addressed.0.id', $newer->id)
            ->where('addressed.1.id', $older->id)
            ->where('addressed.0.status', QuestionStatus::Addressed->value)
        );
});

test('a member without ManageQuestions cannot view the control panel', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $member->id,
    ]);

    $this->actingAs($member)
        ->get(route('stream.show', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertForbidden();
});
