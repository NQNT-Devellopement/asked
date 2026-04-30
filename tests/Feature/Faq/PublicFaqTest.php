<?php

use App\Enums\AnswerSourcePlatform;
use App\Enums\QuestionStatus;
use App\Models\Question;
use App\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

beforeEach(function () {
    Config::set('inertia.testing.ensure_pages_exist', false);
    RateLimiter::clear('faq-submit');
});

test('it shows the public FAQ page for a team with approved questions', function () {
    $team = Team::factory()->create(['name' => 'Acme', 'slug' => 'acme']);

    Question::factory()->approved()->create([
        'team_id' => $team->id,
        'body' => 'How do you make coffee?',
    ]);

    $response = $this->get(route('faq.show', $team));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('faq/show')
        ->where('team.slug', 'acme')
        ->has('questions', 1)
        ->where('questions.0.body', 'How do you make coffee?')
        ->where('questions.0.status', QuestionStatus::Approved->value)
    );
});

test('it does not show pending or rejected questions to the public', function () {
    $team = Team::factory()->create();

    Question::factory()->create([
        'team_id' => $team->id,
        'body' => 'Pending question',
    ]);

    Question::factory()->rejected()->create([
        'team_id' => $team->id,
        'body' => 'Rejected question',
    ]);

    Question::factory()->approved()->create([
        'team_id' => $team->id,
        'body' => 'Approved question',
    ]);

    $response = $this->get(route('faq.show', $team));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('questions', 1)
        ->where('questions.0.body', 'Approved question')
    );
});

test('it shows answered questions with their source platform and url', function () {
    $team = Team::factory()->create();

    Question::factory()->create([
        'team_id' => $team->id,
        'body' => 'Where can I watch the stream?',
        'status' => QuestionStatus::Answered,
        'answered_at' => now(),
        'answer_source_type' => AnswerSourcePlatform::YouTube,
        'answer_source_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'answer_source_label' => 'Watch the explanation',
    ]);

    $response = $this->get(route('faq.show', $team));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('questions', 1)
        ->where('questions.0.status', QuestionStatus::Answered->value)
        ->where('questions.0.answerSource.url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        ->where('questions.0.answerSource.platform', AnswerSourcePlatform::YouTube->value)
        ->where('questions.0.answerSource.label', 'Watch the explanation')
    );
});

test('it accepts a valid question submission and pending status defaults with hashed IP', function () {
    $team = Team::factory()->create();

    $response = $this
        ->withServerVariables(['REMOTE_ADDR' => '203.0.113.5'])
        ->post(route('faq.questions.store', $team), [
            'body' => 'Can you explain how the FAQ works?',
            'author_name' => 'Curious Cat',
        ]);

    $response->assertRedirect();

    $expectedHash = hash('sha256', '203.0.113.5|'.$team->id);

    $this->assertDatabaseHas('questions', [
        'team_id' => $team->id,
        'body' => 'Can you explain how the FAQ works?',
        'author_name' => 'Curious Cat',
        'status' => QuestionStatus::Pending->value,
        'submitter_ip_hash' => $expectedHash,
    ]);
});

test('it rejects a too-short body', function () {
    $team = Team::factory()->create();

    $response = $this->post(route('faq.questions.store', $team), [
        'body' => 'hi',
    ]);

    $response->assertSessionHasErrors('body');

    $this->assertDatabaseCount('questions', 0);
});

test('it rate-limits after 5 submissions per minute', function () {
    $team = Team::factory()->create();

    foreach (range(1, 5) as $i) {
        $this
            ->withServerVariables(['REMOTE_ADDR' => '198.51.100.7'])
            ->post(route('faq.questions.store', $team), [
                'body' => "Question number {$i} from a curious visitor.",
            ])
            ->assertRedirect();
    }

    $response = $this
        ->withServerVariables(['REMOTE_ADDR' => '198.51.100.7'])
        ->post(route('faq.questions.store', $team), [
            'body' => 'One question too many to be allowed through.',
        ]);

    $response->assertStatus(429);
});

test('the payload exposes a normalized banned words list combining global and team', function () {
    $team = Team::factory()->create(['banned_words' => ['blorp']]);

    $response = $this->get(route('faq.show', $team));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('bannedWords')
        ->where('bannedWords', fn ($list) => in_array('blorp', $list->toArray(), true) && in_array('fuck', $list->toArray(), true))
    );
});
