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

test('apply-source without question_ids updates every addressed question of the session', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $first = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Addressed,
        'addressed_in_session_id' => $session->id,
        'addressed_at' => now()->subMinutes(3),
    ]);
    $second = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Addressed,
        'addressed_in_session_id' => $session->id,
        'addressed_at' => now()->subMinutes(2),
    ]);

    $url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    $this->actingAs($owner)
        ->post(route('stream.apply-source', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => $url,
            'source_label' => 'VOD',
        ])
        ->assertRedirect();

    foreach ([$first, $second] as $question) {
        $fresh = $question->fresh();
        expect($fresh->status)->toEqual(QuestionStatus::Answered);
        expect($fresh->answer_source_url)->toEqual($url);
        expect($fresh->answer_source_label)->toEqual('VOD');
        expect($fresh->answer_source_type)->toEqual(AnswerSourcePlatform::YouTube);
    }
});

test('apply-source with question_ids subset only updates the targeted ones', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $targeted = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Addressed,
        'addressed_in_session_id' => $session->id,
        'addressed_at' => now()->subMinutes(3),
    ]);
    $untouched = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Addressed,
        'addressed_in_session_id' => $session->id,
        'addressed_at' => now()->subMinutes(2),
    ]);

    $url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    $this->actingAs($owner)
        ->post(route('stream.apply-source', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => $url,
            'question_ids' => [$targeted->id],
        ])
        ->assertRedirect();

    $freshTargeted = $targeted->fresh();
    expect($freshTargeted->status)->toEqual(QuestionStatus::Answered);
    expect($freshTargeted->answer_source_url)->toEqual($url);

    $freshUntouched = $untouched->fresh();
    expect($freshUntouched->status)->toEqual(QuestionStatus::Addressed);
    expect($freshUntouched->answer_source_url)->toBeNull();
});

test('apply-source can override an already-answered question', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $oldUrl = 'https://www.twitch.tv/videos/123456789';

    $question = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Answered,
        'answer_source_url' => $oldUrl,
        'answer_source_type' => AnswerSourcePlatform::Twitch,
        'answer_source_label' => 'Old',
        'addressed_in_session_id' => $session->id,
        'addressed_at' => now()->subMinutes(5),
        'answered_at' => now()->subMinutes(5),
    ]);

    $newUrl = 'https://www.youtube.com/watch?v=NEW';

    $this->actingAs($owner)
        ->post(route('stream.apply-source', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => $newUrl,
            'source_label' => 'New label',
            'question_ids' => [$question->id],
        ])
        ->assertRedirect();

    $fresh = $question->fresh();
    expect($fresh->status)->toEqual(QuestionStatus::Answered);
    expect($fresh->answer_source_url)->toEqual($newUrl);
    expect($fresh->answer_source_type)->toEqual(AnswerSourcePlatform::YouTube);
    expect($fresh->answer_source_label)->toEqual('New label');
});

test('apply-source rejects an invalid url', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.apply-source', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => 'not-a-url',
        ])
        ->assertSessionHasErrors('source_url');
});

test('apply-source requires a url', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.apply-source', ['current_team' => $team->slug, 'session' => $session->id]), [])
        ->assertSessionHasErrors('source_url');
});

test('apply-source ignores question_ids that do not belong to this session', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $otherSession = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $foreignQuestion = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Addressed,
        'addressed_in_session_id' => $otherSession->id,
        'addressed_at' => now(),
    ]);

    $url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    $this->actingAs($owner)
        ->post(route('stream.apply-source', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => $url,
            'question_ids' => [$foreignQuestion->id],
        ])
        ->assertRedirect();

    $fresh = $foreignQuestion->fresh();
    expect($fresh->status)->toEqual(QuestionStatus::Addressed);
    expect($fresh->answer_source_url)->toBeNull();
});

test('member without ManageQuestions cannot apply source', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $member->id,
    ]);

    $this->actingAs($member)
        ->post(route('stream.apply-source', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ])
        ->assertForbidden();
});

test('apply-source on a session from another team is 404', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $foreign = StreamSession::factory()->create([
        'team_id' => $otherTeam->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.apply-source', ['current_team' => $team->slug, 'session' => $foreign->id]), [
            'source_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ])
        ->assertNotFound();
});
