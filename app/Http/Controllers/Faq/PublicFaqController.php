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
     */
    public function show(Team $team): Response
    {
        $payload = Cache::remember(
            "team:{$team->id}:public-faq",
            now()->addSeconds(30),
            fn (): array => [
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
            ],
        );

        return Inertia::render('faq/show', $payload);
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
