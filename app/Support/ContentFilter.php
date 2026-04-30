<?php

namespace App\Support;

use App\Models\Team;
use Illuminate\Support\Str;

final class ContentFilter
{
    /** @var list<string>|null */
    private static ?array $globalCache = null;

    private const LEET_MAP = [
        '0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a',
        '5' => 's', '7' => 't', '@' => 'a', '$' => 's',
    ];

    /**
     * Check whether the text contains a banned word for this team.
     * Returns the offending normalized token, or null if clean.
     */
    public function check(string $text, Team $team): ?string
    {
        $tokens = $this->tokenize($text);
        if ($tokens === []) {
            return null;
        }

        $banned = array_flip($this->bannedWordsForClient($team));

        foreach ($tokens as $token) {
            if (isset($banned[$token])) {
                return $token;
            }
        }

        return null;
    }

    /**
     * Normalize a word/sentence to the canonical form used for matching:
     * lowercase, ASCII (no diacritics), with leetspeak digits/symbols folded.
     * Does NOT strip punctuation — tokenize() handles word boundaries.
     */
    public function normalize(string $text): string
    {
        $text = mb_strtolower($text);
        $text = Str::ascii($text);

        return strtr($text, self::LEET_MAP);
    }

    /**
     * Build the deduplicated, normalized list (global + team) for matching
     * and for exposing to the client.
     *
     * @return list<string>
     */
    public function bannedWordsForClient(Team $team): array
    {
        return array_values(array_unique(array_merge(
            $this->global(),
            $this->teamWords($team),
        )));
    }

    /**
     * Tokenize: normalize, then split on anything that isn't [a-z].
     *
     * @return list<string>
     */
    private function tokenize(string $text): array
    {
        $normalized = $this->normalize($text);
        $tokens = preg_split('/[^a-z]+/', $normalized, -1, PREG_SPLIT_NO_EMPTY);

        return $tokens === false ? [] : array_values($tokens);
    }

    /**
     * Lazy-load and memoize the global list from disk.
     *
     * @return list<string>
     */
    private function global(): array
    {
        if (self::$globalCache !== null) {
            return self::$globalCache;
        }

        $path = resource_path('banwords/global.txt');
        $lines = is_file($path)
            ? (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [])
            : [];

        $words = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }
            $normalized = $this->normalize($line);
            if ($normalized !== '') {
                $words[] = $normalized;
            }
        }

        return self::$globalCache = array_values(array_unique($words));
    }

    /**
     * Read team words and normalize at read time (defensive — the request
     * stores them lowercase+trim, but we normalize again so behavior is
     * consistent regardless of how data got into the column).
     *
     * @return list<string>
     */
    private function teamWords(Team $team): array
    {
        $stored = $team->banned_words ?? [];
        if (! is_array($stored)) {
            return [];
        }

        return array_values(array_filter(array_map(
            fn ($word): string => $this->normalize((string) $word),
            $stored,
        ), fn (string $word): bool => $word !== ''));
    }
}
