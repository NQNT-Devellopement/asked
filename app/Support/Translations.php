<?php

namespace App\Support;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;

class Translations
{
    /**
     * Build a flat dotted-key dictionary of every translation in the given
     * locale's PHP files. The result is what gets shipped to the React side
     * via Inertia shared props.
     *
     * Example: `lang/en/app.php` returning `['nav' => ['inbox' => 'Inbox']]`
     * surfaces as `['app.nav.inbox' => 'Inbox']`.
     *
     * The result is cached for one hour. Translation files only change at
     * deploy time, and the deploy entrypoint runs `php artisan cache:clear`
     * (when configured) or the natural 1h TTL takes care of it. Reading
     * ~12 PHP files + flattening them on every Inertia page hit was a real
     * cost at scale.
     *
     * @return array<string, string>
     */
    public static function flatten(string $locale): array
    {
        // Version the cache key by the locale directory's last modification
        // time so a deploy with edited / added / removed lang files
        // automatically misses the old cache without needing a manual
        // `cache:clear`.
        return Cache::remember(
            self::cacheKey($locale),
            now()->addDay(),
            fn (): array => self::buildFlat($locale),
        );
    }

    /**
     * Forget cached dictionaries for one locale (or all if null). Called by
     * deploy scripts and any code path that touches lang/* files at runtime.
     *
     * The cache key is versioned by the locale directory's `filemtime`, so
     * we recompute the same suffix here. Otherwise this would silently miss
     * the real key and leave stale translations in cache.
     */
    public static function forget(?string $locale = null): void
    {
        if ($locale !== null) {
            Cache::forget(self::cacheKey($locale));

            return;
        }

        foreach (File::directories(lang_path()) as $dir) {
            Cache::forget(self::cacheKey(basename($dir)));
        }
    }

    /**
     * Build the versioned cache key for a locale, matching the key written
     * by `flatten()`.
     */
    protected static function cacheKey(string $locale): string
    {
        $directory = lang_path($locale);
        $version = File::isDirectory($directory) ? filemtime($directory) : 0;

        return "translations:flatten:{$locale}:{$version}";
    }

    /**
     * Build the dotted dictionary from disk (uncached).
     *
     * @return array<string, string>
     */
    protected static function buildFlat(string $locale): array
    {
        $directory = lang_path($locale);

        if (! File::isDirectory($directory)) {
            return [];
        }

        $merged = [];

        foreach (File::files($directory) as $file) {
            if ($file->getExtension() !== 'php') {
                continue;
            }

            $namespace = $file->getFilenameWithoutExtension();
            $contents = require $file->getPathname();

            if (! is_array($contents)) {
                continue;
            }

            $merged[$namespace] = $contents;
        }

        return Arr::dot($merged);
    }
}
