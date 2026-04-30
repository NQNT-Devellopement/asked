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
        $directory = lang_path($locale);

        // Version the cache key by the directory's last modification time so a
        // deploy with edited / added / removed lang files automatically misses
        // the old cache without needing a manual `cache:clear`.
        $version = File::isDirectory($directory) ? filemtime($directory) : 0;

        return Cache::remember(
            "translations:flatten:{$locale}:{$version}",
            now()->addDay(),
            fn (): array => self::buildFlat($locale),
        );
    }

    /**
     * Forget cached dictionaries for one locale (or all if null). Called by
     * deploy scripts and any code path that touches lang/* files at runtime.
     */
    public static function forget(?string $locale = null): void
    {
        if ($locale !== null) {
            Cache::forget("translations:flatten:{$locale}");

            return;
        }

        foreach (File::directories(lang_path()) as $dir) {
            Cache::forget('translations:flatten:'.basename($dir));
        }
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
