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

test('guests are redirected to login', function () {
    $team = Team::factory()->create();

    $this->get(route('questions.inbox', $team))->assertRedirect(route('login'));
});

test('a member without ManageQuestions permission is forbidden', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->get(route('questions.inbox', $team))
        ->assertForbidden();
});

test('owners see only pending questions, ordered by newest first', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $older = Question::factory()->create([
        'team_id' => $team->id,
        'body' => 'Older pending question',
        'created_at' => now()->subHour(),
    ]);

    $newer = Question::factory()->create([
        'team_id' => $team->id,
        'body' => 'Newer pending question',
        'created_at' => now(),
    ]);

    Question::factory()->approved()->create([
        'team_id' => $team->id,
        'body' => 'Approved should not appear',
    ]);

    $this->actingAs($owner)
        ->get(route('questions.inbox', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('questions/inbox')
            ->where('team.slug', $team->slug)
            ->has('pendingQuestions', 2)
            ->where('pendingQuestions.0.id', $newer->id)
            ->where('pendingQuestions.1.id', $older->id)
            ->where('permissions.canModerate', true)
        );
});

test('the submitter ip hash is truncated to 8 characters', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Pending,
        'submitter_ip_hash' => str_repeat('a', 64),
    ]);

    $this->actingAs($owner)
        ->get(route('questions.inbox', $team))
        ->assertInertia(fn ($page) => $page
            ->where('pendingQuestions.0.submitterIpHash', 'aaaaaaaa')
        );
});
