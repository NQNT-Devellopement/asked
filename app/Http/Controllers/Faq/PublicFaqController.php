<?php

namespace App\Http\Controllers\Faq;

use App\Enums\QuestionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Faq\StoreQuestionRequest;
use App\Models\Team;
use App\Support\QuestionPresenter;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicFaqController extends Controller
{
    /**
     * Display the public FAQ page for the team.
     */
    public function show(Team $team): Response
    {
        $questions = $team->questions()
            ->publiclyVisible()
            ->with('questionList:id,name,color')
            ->get()
            ->map(QuestionPresenter::toArray(...));

        return Inertia::render('faq/show', [
            'team' => [
                'name' => $team->name,
                'headline' => $team->headline,
                'tagline' => $team->tagline,
                'slug' => $team->slug,
                'template' => $team->template->value,
                'theme' => $team->getThemeWithDefaults(),
            ],
            'questions' => $questions,
        ]);
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
