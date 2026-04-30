<?php

namespace App\Http\Middleware;

use App\Enums\Locale;
use App\Enums\QuestionStatus;
use App\Models\Question;
use App\Support\Translations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $locale = App::getLocale();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currentTeam' => fn () => $user?->currentTeam ? $user->toUserTeam($user->currentTeam) : null,
            'teams' => fn () => $user?->toUserTeams(includeCurrent: true) ?? [],
            // Cache the pending-count for ~10s — the sidebar badge can lag a
            // few seconds with no UX impact, but on a busy app every request
            // would otherwise issue this `count(*)` query against `questions`.
            'questionStats' => fn () => $user?->currentTeam ? Cache::remember(
                "team:{$user->currentTeam->id}:pendingCount",
                now()->addSeconds(10),
                fn (): array => [
                    'pendingCount' => Question::where('team_id', $user->currentTeam->id)
                        ->where('status', QuestionStatus::Pending)
                        ->count(),
                ],
            ) : null,
            'locale' => $locale,
            'availableLocales' => collect(Locale::supported())
                ->map(fn (Locale $locale): array => [
                    'code' => $locale->value,
                    'label' => $locale->nativeName(),
                ])
                ->all(),
            'translations' => fn () => Translations::flatten($locale),
        ];
    }
}
