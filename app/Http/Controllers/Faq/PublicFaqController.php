<?php

namespace App\Http\Controllers\Faq;

use App\Enums\QuestionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Faq\StoreQuestionRequest;
use App\Models\Team;
use App\Support\QuestionPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PublicFaqController extends Controller
{
    /**
     * Display the public FAQ page for the team.
     *
     * The team page is identical for every visitor (no per-user state) so
     * the entire props payload is cached by team id for 30 seconds. The
     * Team `saved` and Question `saved`/`deleted` hooks bust this key on
     * any change that affects what's rendered, so creators and moderators
     * still see updates instantly. The 30s ceiling protects against drift
     * if a hook is ever missed.
     *
     * Cache misses go through a Redis lock so only ONE worker recomputes
     * across the fleet; everyone else waits up to 3s for the result. The
     * compute itself is ~1s p95 (DB queries + theme merge + presenter
     * mapping), so 3s is a comfortable budget. Without this, a viral
     * spike at the moment the cache expires would stampede all FPM
     * workers onto the same queries — exactly what the Traefik 30s
     * timeout was killing in the 200-VU public-page test.
     */
    public function show(Team $team): Response
    {
        $key = "team:{$team->id}:public-faq";

        $payload = Cache::get($key) ?? Cache::lock("{$key}:lock", 10)->block(
            3,
            fn (): array => Cache::remember(
                $key,
                now()->addSeconds(30),
                fn (): array => $this->buildPayload($team),
            ),
        );

        return Inertia::render('faq/show', $payload);
    }

    /**
     * Build the props payload for the public FAQ page. Pulled out of the
     * cached closure so the lock-protected fallback path can call it too.
     *
     * @return array<string, mixed>
     */
    protected function buildPayload(Team $team): array
    {
        return [
            'team' => [
                'name' => $team->name,
                'headline' => $team->headline,
                'tagline' => $team->tagline,
                'slug' => $team->slug,
                'template' => $team->template->value,
                'theme' => $team->getThemeWithDefaults(),
            ],
            'questions' => $team->questions()
                ->publiclyVisible()
                ->with('questionList:id,name,color')
                ->get()
                ->map(QuestionPresenter::toArray(...))
                ->values()
                ->all(),
        ];
    }

    /**
     * Store a publicly submitted question for the team.
     */
    public function storeQuestion(StoreQuestionRequest $request, Team $team): RedirectResponse
    {
        $team->questions()->create([
            'author_name' => $request->validated('author_name'),
            'body' => $request->validated('body'),
            'status' => QuestionStatus::Pending,
            'submitter_ip_hash' => hash('sha256', $request->ip().'|'.$team->id),
        ]);

        return back();
    }
}
