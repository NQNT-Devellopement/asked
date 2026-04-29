<?php

namespace App\Enums;

enum AnswerSourcePlatform: string
{
    case YouTube = 'youtube';
    case Twitch = 'twitch';
    case Twitter = 'twitter';
    case TikTok = 'tiktok';
    case Instagram = 'instagram';
    case Spotify = 'spotify';
    case Website = 'website';

    /**
     * Detect the platform from the given URL.
     */
    public static function detect(string $url): self
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));

        if ($host === '') {
            return self::Website;
        }

        return match (true) {
            str_contains($host, 'youtube.com'), str_contains($host, 'youtu.be') => self::YouTube,
            str_contains($host, 'twitch.tv') => self::Twitch,
            str_contains($host, 'twitter.com'), str_contains($host, 'x.com') => self::Twitter,
            str_contains($host, 'tiktok.com') => self::TikTok,
            str_contains($host, 'instagram.com') => self::Instagram,
            str_contains($host, 'spotify.com') => self::Spotify,
            default => self::Website,
        };
    }
}
