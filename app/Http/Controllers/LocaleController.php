<?php

namespace App\Http\Controllers;

use App\Enums\Locale;
use App\Http\Requests\UpdateLocaleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cookie;

class LocaleController extends Controller
{
    /**
     * Update the active locale for the current visitor. Persists on the user
     * record when authenticated, always sets a long-lived cookie so the choice
     * survives logout / future visits.
     */
    public function update(UpdateLocaleRequest $request): RedirectResponse
    {
        $locale = Locale::from($request->validated('locale'));

        $request->user()?->forceFill(['locale' => $locale->value])->save();

        // One year, accessible from JS (not encrypted) so static error pages
        // can read it before Laravel boots.
        Cookie::queue('locale', $locale->value, 60 * 24 * 365);

        return back();
    }
}
