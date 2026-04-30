<?php

namespace App\Http\Controllers\Teams;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teams\UpdateModerationSettingsRequest;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ModerationSettingsController extends Controller
{
    /**
     * Show the moderation settings page (banned words list) for the team.
     */
    public function edit(Team $team): InertiaResponse
    {
        Gate::authorize('manageModeration', $team);

        return Inertia::render('settings/moderation', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
            ],
            'bannedWords' => $team->banned_words ?? [],
        ]);
    }

    /**
     * Persist the team's banned-word list. The Team::saved hook busts the
     * public FAQ cache automatically, so the change is immediately visible.
     */
    public function update(UpdateModerationSettingsRequest $request, Team $team): RedirectResponse
    {
        $words = (array) $request->validated('words', []);

        $team->update(['banned_words' => array_values($words)]);

        return back();
    }
}
