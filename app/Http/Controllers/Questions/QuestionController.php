<?php

namespace App\Http\Controllers\Questions;

use App\Enums\AnswerSourcePlatform;
use App\Enums\QuestionStatus;
use App\Enums\TeamPermission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Questions\AnswerQuestionRequest;
use App\Http\Requests\Questions\ModerateQuestionRequest;
use App\Http\Requests\Questions\ReorderQuestionsRequest;
use App\Models\Question;
use App\Models\QuestionList;
use App\Models\Team;
use App\Support\QuestionPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class QuestionController extends Controller
{
    /**
     * Show the moderation inbox of pending questions for the current team.
     */
    public function inbox(Request $request, Team $current_team): InertiaResponse
    {
        Gate::authorize('viewAny', [Question::class, $current_team]);

        $user = $request->user();

        $pendingQuestions = $current_team->questions()
            ->where('status', QuestionStatus::Pending)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Question $question): array => [
                'id' => $question->id,
                'body' => $question->body,
                'authorName' => $question->author_name,
                'createdAt' => $question->created_at->toIso8601String(),
                'submitterIpHash' => $question->submitter_ip_hash
                    ? substr($question->submitter_ip_hash, 0, 8)
                    : null,
            ]);

        return Inertia::render('questions/inbox', [
            'team' => [
                'name' => $current_team->name,
                'slug' => $current_team->slug,
            ],
            'pendingQuestions' => $pendingQuestions,
            'permissions' => [
                'canModerate' => $user->hasTeamPermission($current_team, TeamPermission::ModerateQuestions),
            ],
        ]);
    }

    /**
     * Show the management board with question lists and unsorted questions.
     */
    public function board(Request $request, Team $current_team): InertiaResponse
    {
        Gate::authorize('viewAny', [Question::class, $current_team]);

        $user = $request->user();

        $lists = $current_team->questionLists()
            ->orderBy('position')
            ->with(['questions' => function ($query): void {
                $query
                    ->whereIn('status', [
                        QuestionStatus::Pending->value,
                        QuestionStatus::Approved->value,
                        QuestionStatus::Answered->value,
                    ])
                    ->orderBy('position');
            }, 'questions.questionList:id,name,color'])
            ->get()
            ->map(fn (QuestionList $list): array => [
                'id' => $list->id,
                'name' => $list->name,
                'color' => $list->color,
                'position' => $list->position,
                'questions' => $list->questions->map(QuestionPresenter::toArray(...))->values(),
            ])
            ->values();

        $unsorted = $current_team->questions()
            ->whereNull('question_list_id')
            ->whereIn('status', [QuestionStatus::Approved->value, QuestionStatus::Answered->value])
            ->orderBy('position')
            ->orderByDesc('created_at')
            ->with('questionList:id,name,color')
            ->get()
            ->map(QuestionPresenter::toArray(...))
            ->values();

        return Inertia::render('questions/board', [
            'team' => [
                'name' => $current_team->name,
                'slug' => $current_team->slug,
            ],
            'lists' => $lists,
            'unsorted' => $unsorted,
            'permissions' => [
                'canManageQuestions' => $user->hasTeamPermission($current_team, TeamPermission::ManageQuestions),
                'canModerateQuestions' => $user->hasTeamPermission($current_team, TeamPermission::ModerateQuestions),
                'canCreateList' => $user->hasTeamPermission($current_team, TeamPermission::ManageQuestions),
                'canDeleteList' => $user->hasTeamPermission($current_team, TeamPermission::ManageQuestions),
            ],
        ]);
    }

    /**
     * Approve or reject a pending question.
     */
    public function moderate(ModerateQuestionRequest $request, Team $current_team, Question $question): RedirectResponse
    {
        $this->ensureBelongsToTeam($current_team, $question);

        Gate::authorize('moderate', $question);

        $question->update([
            'status' => $request->validated('decision') === 'approve'
                ? QuestionStatus::Approved
                : QuestionStatus::Rejected,
        ]);

        return back();
    }

    /**
     * Mark a question as answered with a source URL.
     */
    public function answer(AnswerQuestionRequest $request, Team $current_team, Question $question): RedirectResponse
    {
        $this->ensureBelongsToTeam($current_team, $question);

        Gate::authorize('update', $question);

        $url = $request->validated('source_url');

        $question->update([
            'answer_source_url' => $url,
            'answer_source_label' => $request->validated('source_label'),
            'answer_source_type' => AnswerSourcePlatform::detect($url),
            'status' => QuestionStatus::Answered,
            'answered_at' => now(),
        ]);

        return back();
    }

    /**
     * Revert a previously answered question back to approved.
     */
    public function unanswer(Request $request, Team $current_team, Question $question): RedirectResponse
    {
        $this->ensureBelongsToTeam($current_team, $question);

        Gate::authorize('update', $question);

        abort_if($question->status !== QuestionStatus::Answered, 404);

        $question->update([
            'answer_source_url' => null,
            'answer_source_label' => null,
            'answer_source_type' => null,
            'answered_at' => null,
            'status' => QuestionStatus::Approved,
        ]);

        return back();
    }

    /**
     * Permanently delete a question.
     */
    public function destroy(Team $current_team, Question $question): RedirectResponse
    {
        $this->ensureBelongsToTeam($current_team, $question);

        Gate::authorize('delete', $question);

        $question->delete();

        return back();
    }

    /**
     * Bulk reorder questions and re-assign them to lists. The frontend uses
     * `router.post(..., { only: [] })` so no props are refreshed; we just
     * need to return an Inertia-compatible response (a 204 confuses Inertia
     * v3's non-Inertia-response detector and surfaces an empty fullscreen
     * modal — `back()` keeps the user on the same page with no prop churn).
     */
    public function reorder(ReorderQuestionsRequest $request, Team $current_team): RedirectResponse
    {
        /** @var array<int, array{id: int, list_id: ?int, position: int}> $items */
        $items = $request->validated('items');

        $questionIds = collect($items)->pluck('id')->unique()->values();
        $listIds = collect($items)->pluck('list_id')->filter()->unique()->values();

        $teamQuestionIds = $current_team->questions()->whereIn('id', $questionIds)->pluck('id');
        abort_if($teamQuestionIds->count() !== $questionIds->count(), 422);

        if ($listIds->isNotEmpty()) {
            $teamListIds = $current_team->questionLists()->whereIn('id', $listIds)->pluck('id');
            abort_if($teamListIds->count() !== $listIds->count(), 422);
        }

        DB::transaction(function () use ($items): void {
            foreach ($items as $item) {
                Question::where('id', $item['id'])->update([
                    'question_list_id' => $item['list_id'] ?? null,
                    'position' => $item['position'],
                ]);
            }
        });

        return back();
    }

    /**
     * Confirm the question belongs to the URL-bound team.
     */
    protected function ensureBelongsToTeam(Team $current_team, Question $question): void
    {
        abort_if($question->team_id !== $current_team->id, 404);
    }
}
