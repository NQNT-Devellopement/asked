<?php

namespace App\Support;

use Illuminate\Support\Arr;
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
     * @return array<string, string>
     */
    public static function flatten(string $locale): array
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
