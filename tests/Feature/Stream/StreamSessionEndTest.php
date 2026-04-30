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

test('end without url marks session inactive and leaves addressed questions in addressed', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
        'is_active' => true,
    ]);

    $addressed = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Addressed,
        'addressed_in_session_id' => $session->id,
        'addressed_at' => now(),
    ]);

    $this->actingAs($owner)
        ->post(route('stream.end', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertRedirect();

    $freshSession = $session->fresh();
    expect($freshSession->is_active)->toBeFalse();
    expect($freshSession->current_question_id)->toBeNull();

    $freshQuestion = $addressed->fresh();
    expect($freshQuestion->status)->toEqual(QuestionStatus::Addressed);
    expect($freshQuestion->answer_source_url)->toBeNull();
    expect($freshQuestion->answered_at)->toBeNull();
});

test('end with url applies bulk source to all pending addressed questions', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
        'is_active' => true,
    ]);

    $first = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Addressed,
        'addressed_in_session_id' => $session->id,
        'addressed_at' => now()->subMinutes(5),
    ]);
    $second = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Addressed,
        'addressed_in_session_id' => $session->id,
        'addressed_at' => now()->subMinute(),
    ]);

    $url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    $this->actingAs($owner)
        ->post(route('stream.end', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => $url,
            'source_label' => 'My VOD',
        ])
        ->assertRedirect();

    foreach ([$first, $second] as $question) {
        $fresh = $question->fresh();
        expect($fresh->status)->toEqual(QuestionStatus::Answered);
        expect($fresh->answer_source_url)->toEqual($url);
        expect($fresh->answer_source_label)->toEqual('My VOD');
        expect($fresh->answer_source_type)->toEqual(AnswerSourcePlatform::YouTube);
        expect($fresh->answered_at)->not->toBeNull();
    }

    expect($session->fresh()->is_active)->toBeFalse();
});

test('end with url does not overwrite already-answered questions in the addressed pile', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $existingUrl = 'https://www.twitch.tv/videos/123456789';

    $alreadyAnswered = Question::factory()->create([
        'team_id' => $team->id,
        'status' => QuestionStatus::Answered,
        'answer_source_url' => $existingUrl,
        'answer_source_type' => AnswerSourcePlatform::Twitch,
        'answer_source_label' => 'Earlier override',
        'addressed_in_session_id' => $session->id,
        'addressed_at' => now()->subMinutes(10),
        'answered_at' => now()->subMinutes(10),
    ]);

    $newUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    $this->actingAs($owner)
        ->post(route('stream.end', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => $newUrl,
        ])
        ->assertRedirect();

    $fresh = $alreadyAnswered->fresh();
    expect($fresh->answer_source_url)->toEqual($existingUrl);
    expect($fresh->answer_source_type)->toEqual(AnswerSourcePlatform::Twitch);
    expect($fresh->answer_source_label)->toEqual('Earlier override');
});

test('member without ManageQuestions cannot end the session', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();
    $team->members()->attach($member, ['role' => TeamRole::Member->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $member->id,
    ]);

    $this->actingAs($member)
        ->post(route('stream.end', ['current_team' => $team->slug, 'session' => $session->id]))
        ->assertForbidden();
});

test('ending a session from another team is 404', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $otherTeam = Team::factory()->create();
    $foreign = StreamSession::factory()->create([
        'team_id' => $otherTeam->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.end', ['current_team' => $team->slug, 'session' => $foreign->id]))
        ->assertNotFound();
});

test('end rejects an invalid url', function () {
    $team = Team::factory()->create();
    $owner = User::factory()->create();
    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $session = StreamSession::factory()->create([
        'team_id' => $team->id,
        'created_by_user_id' => $owner->id,
    ]);

    $this->actingAs($owner)
        ->post(route('stream.end', ['current_team' => $team->slug, 'session' => $session->id]), [
            'source_url' => 'not-a-url',
        ])
        ->assertSessionHasErrors('source_url');
});
