<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Config::set('inertia.testing.ensure_pages_exist', false);
    RateLimiter::clear('faq-submit');
});

test('it blocks a submission whose body contains a global banned word', function () {
    $team = Team::factory()->create();

    $response = $this->post(route('faq.questions.store', $team), [
        'body' => 'this is total shit and I hate it deeply',
    ]);

    $response->assertSessionHasErrors('body');
    $this->assertDatabaseCount('questions', 0);
});

test('it blocks a submission whose author_name contains a banned word', function () {
    $team = Team::factory()->create();

    $response = $this->post(route('faq.questions.store', $team), [
        'body' => 'just a perfectly clean question for the team',
        'author_name' => 'fuck you',
    ]);

    $response->assertSessionHasErrors('author_name');
    $this->assertDatabaseCount('questions', 0);
});

test('it blocks a submission with a team-specific banned word', function () {
    $team = Team::factory()->create(['banned_words' => ['blorp']]);

    $response = $this->post(route('faq.questions.store', $team), [
        'body' => 'why is this blorp happening on the stream lately',
    ]);

    $response->assertSessionHasErrors('body');
    $this->assertDatabaseCount('questions', 0);
});

test('it accepts a clean submission unchanged', function () {
    $team = Team::factory()->create();

    $response = $this->post(route('faq.questions.store', $team), [
        'body' => 'How do you set up the OBS overlay for a new session?',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseCount('questions', 1);
});

test('the error message does not leak the offending word', function () {
    $team = Team::factory()->create();

    $this->post(route('faq.questions.store', $team), [
        'body' => 'this is total shit and I hate it deeply',
    ]);

    $errors = session('errors');
    // The session-stored errors may be a ViewErrorBag or its serialized
    // array form depending on the framework's session lifecycle. Handle
    // both shapes so we always end up with the body messages array.
    if (is_object($errors) && method_exists($errors, 'getBag')) {
        $messages = $errors->getBag('default')->get('body');
    } else {
        $messages = $errors['default']['messages']['body'] ?? [];
    }

    expect($messages)->not->toBeEmpty();
    foreach ($messages as $message) {
        expect($message)->not->toContain('shit');
    }
});

test('leetspeak attempts are caught', function () {
    $team = Team::factory()->create();

    // 'n1gger' → 'nigger' via leet 1→i
    $response = $this->post(route('faq.questions.store', $team), [
        'body' => 'why is this n1gger word being used here every single time we try',
    ]);

    $response->assertSessionHasErrors('body');
    $this->assertDatabaseCount('questions', 0);
});
