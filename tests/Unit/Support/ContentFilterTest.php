<?php

use App\Models\Team;
use App\Support\ContentFilter;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function (): void {
    $this->filter = new ContentFilter;
});

it('returns null for clean text', function () {
    $team = new Team(['banned_words' => []]);

    expect($this->filter->check('Hello, can you explain this?', $team))->toBeNull();
});

it('detects an exact global banned word', function () {
    $team = new Team(['banned_words' => []]);

    expect($this->filter->check('this is some shit', $team))->toBe('shit');
});

it('ignores partial substrings', function () {
    $team = new Team(['banned_words' => []]);

    // "shitake" should NOT match "shit" — whole-word matching only.
    expect($this->filter->check('I love shitake mushrooms', $team))->toBeNull();
});

it('normalizes diacritics', function () {
    $team = new Team(['banned_words' => []]);

    // "encule" is in the global list; "enculé" must match too.
    expect($this->filter->check('quel enculé', $team))->toBe('encule');
});

it('normalizes leetspeak', function () {
    $team = new Team(['banned_words' => []]);

    // 1 → i (sh1t → shit), 0 → o (sh0t doesn't matter, but go0 → goo)
    expect($this->filter->check('go0 sh1t away', $team))->toBe('shit');
    // @ → a, 1 → i: f@gg1t → faggit (won't match), so use n1gger → nigger
    expect($this->filter->check('what a n1gger', $team))->toBe('nigger');
});

it('strips punctuation around words', function () {
    $team = new Team(['banned_words' => []]);

    expect($this->filter->check('hello, fuck!', $team))->toBe('fuck');
});

it('detects team-specific banned words', function () {
    $team = new Team(['banned_words' => ['blorp']]);

    expect($this->filter->check('this is a blorp situation', $team))->toBe('blorp');
});

it('normalizes team words at read time', function () {
    // The team stored "Câblé" (capital, accent). Filter still matches "cable".
    $team = new Team(['banned_words' => ['Câblé']]);

    expect($this->filter->check('the câble is fine', $team))->toBe('cable');
});

it('exposes a normalized client list deduped across global and team', function () {
    $team = new Team(['banned_words' => ['fuck', 'blorp']]);

    $list = $this->filter->bannedWordsForClient($team);

    // 'fuck' is in both lists — must appear only once.
    expect($list)->toContain('fuck')
        ->and($list)->toContain('blorp')
        ->and(array_count_values($list)['fuck'] ?? 0)->toBe(1);
});

it('exposes normalize() so callers can produce identical client tokens', function () {
    // normalize() does lowercase + ASCII + leet. It does NOT strip punctuation —
    // that's tokenize()'s job. So 'Câblé!' becomes 'cable!' (the '!' stays).
    expect($this->filter->normalize('Câblé!'))->toBe('cable!');
    // SH1T: lowercase 'sh1t', leet 1→i = 'shit'.
    expect($this->filter->normalize('SH1T'))->toBe('shit');
});
