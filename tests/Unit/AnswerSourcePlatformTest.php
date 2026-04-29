<?php

use App\Enums\AnswerSourcePlatform;

test('it detects YouTube urls', function () {
    expect(AnswerSourcePlatform::detect('https://www.youtube.com/watch?v=abc'))
        ->toBe(AnswerSourcePlatform::YouTube);

    expect(AnswerSourcePlatform::detect('https://youtu.be/abc'))
        ->toBe(AnswerSourcePlatform::YouTube);
});

test('it detects Twitch urls', function () {
    expect(AnswerSourcePlatform::detect('https://www.twitch.tv/somestreamer'))
        ->toBe(AnswerSourcePlatform::Twitch);
});

test('it detects Twitter and X urls', function () {
    expect(AnswerSourcePlatform::detect('https://twitter.com/example/status/1'))
        ->toBe(AnswerSourcePlatform::Twitter);

    expect(AnswerSourcePlatform::detect('https://x.com/example/status/1'))
        ->toBe(AnswerSourcePlatform::Twitter);
});

test('it detects TikTok urls', function () {
    expect(AnswerSourcePlatform::detect('https://www.tiktok.com/@user/video/123'))
        ->toBe(AnswerSourcePlatform::TikTok);
});

test('it detects Instagram urls', function () {
    expect(AnswerSourcePlatform::detect('https://www.instagram.com/p/abc/'))
        ->toBe(AnswerSourcePlatform::Instagram);
});

test('it detects Spotify urls', function () {
    expect(AnswerSourcePlatform::detect('https://open.spotify.com/episode/abc'))
        ->toBe(AnswerSourcePlatform::Spotify);

    expect(AnswerSourcePlatform::detect('https://www.spotify.com/some/path'))
        ->toBe(AnswerSourcePlatform::Spotify);
});

test('it falls back to Website for unknown urls', function () {
    expect(AnswerSourcePlatform::detect('https://example.com/post/answer'))
        ->toBe(AnswerSourcePlatform::Website);

    expect(AnswerSourcePlatform::detect('not-a-real-url'))
        ->toBe(AnswerSourcePlatform::Website);
});
