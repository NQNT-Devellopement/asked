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

test('guests are redirected to the login page', function () {
    $team = Team::factory()->create();

    $this->get(route('dashboard', $team))
        ->assertRedirect(route('login'));
});

test('a member of the team can view the dashboard with the expected counts', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    Question::factory()->count(2)->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Pending,
    ]);
    Question::factory()->approved()->count(3)->create([
        'team_id' => $team->id,
    ]);
    Question::factory()->answered()->count(1)->create([
        'team_id' => $team->id,
    ]);
    Question::factory()->rejected()->count(2)->create([
        'team_id' => $team->id,
    ]);
    QuestionList::factory()->count(2)->create(['team_id' => $team->id]);

    $this->actingAs($owner)
        ->get(route('dashboard', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('team.slug', $team->slug)
            ->where('team.name', $team->name)
            ->where('publicUrl', route('faq.show', $team))
            ->where('counts.pending', 2)
            ->where('counts.approved', 3)
            ->where('counts.answered', 1)
            ->where('counts.lists', 2)
            ->where('permissions.canManageQuestions', true)
            ->where('permissions.canModerate', true)
            ->where('permissions.canCustomize', true)
        );
});

test('a user who does not belong to the team gets a 403', function () {
    $team = Team::factory()->create();
    $stranger = User::factory()->create();

    $this->actingAs($stranger)
        ->get(route('dashboard', $team))
        ->assertForbidden();
});

test('recent dispatches exclude rejected questions and limit to five', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    Question::factory()->count(4)->sequence(
        ['created_at' => now()->subMinutes(50), 'body' => 'A'],
        ['created_at' => now()->subMinutes(40), 'body' => 'B'],
        ['created_at' => now()->subMinutes(30), 'body' => 'C'],
        ['created_at' => now()->subMinutes(20), 'body' => 'D'],
    )->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Pending,
    ]);

    Question::factory()->approved()->create([
        'team_id' => $team->id,
        'body' => 'Approved one',
        'created_at' => now()->subMinutes(10),
    ]);

    Question::factory()->rejected()->create([
        'team_id' => $team->id,
        'body' => 'Rejected, hidden',
        'created_at' => now(),
    ]);

    Question::factory()->count(3)->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Pending,
        'created_at' => now()->subSeconds(5),
    ]);

    $this->actingAs($owner)
        ->get(route('dashboard', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('recent', 5)
            ->where('recent.0.status', fn ($status) => $status !== QuestionStatus::Rejected->value)
        );

    $this->actingAs($owner)
        ->get(route('dashboard', $team))
        ->assertInertia(fn ($page) => $page
            ->where('recent', fn ($recent) => collect($recent)
                ->every(fn ($q) => $q['status'] !== QuestionStatus::Rejected->value))
        );
});

test('permissions reflect the role of the current user', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $this->actingAs($member)
        ->get(route('dashboard', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('permissions.canManageQuestions', false)
            ->where('permissions.canModerate', false)
            ->where('permissions.canCustomize', false)
        );
});

test('shared question stats expose the pending count for the current team', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    Question::factory()->count(4)->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Pending,
    ]);
    Question::factory()->approved()->count(2)->create([
        'team_id' => $team->id,
    ]);

    $this->actingAs($owner)
        ->get(route('dashboard', $team))
        ->assertInertia(fn ($page) => $page
            ->where('questionStats.pendingCount', 4)
        );
});
