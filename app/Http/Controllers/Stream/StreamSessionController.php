<?php

namespace App\Http\Controllers\Stream;

use App\Enums\AnswerSourcePlatform;
use App\Enums\QuestionStatus;
use App\Enums\TeamPermission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Stream\AnswerSessionQuestionRequest;
use App\Http\Requests\Stream\ApplySessionSourceRequest;
use App\Http\Requests\Stream\EndSessionRequest;
use App\Http\Requests\Stream\StoreSessionRequest;
use App\Http\Requests\Stream\UpdateSessionRequest;
use App\Models\Question;
use App\Models\StreamSession;
use App\Models\Team;
use App\Support\QuestionPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class StreamSessionController extends Controller
{
    /**
     * List the team's stream sessions.
     */
    public function index(Request $request, Team $current_team): InertiaResponse
    {
        $this->authorizeManage($request, $current_team);

        $user = $request->user();

        $sessions = $current_team->streamSessions()
            ->with(['list:id,name,color', 'currentQuestion.questionList:id,name,color'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (StreamSession $session): array => $this->presentSession($session))
            ->values();

        return Inertia::render('stream/index', [
            'team' => [
                'name' => $current_team->name,
                'slug' => $current_team->slug,
            ],
            'sessions' => $sessions,
            'permissions' => [
                'canManage' => $user->hasTeamPermission($current_team, TeamPermission::ManageQuestions),
            ],
        ]);
    }

    /**
     * Create a new stream session.
     */
    public function store(StoreSessionRequest $request, Team $current_team): RedirectResponse
    {
        $listId = $this->resolveListId($request->validated('list_id'), $current_team);

        $session = $current_team->streamSessions()->create([
            'created_by_user_id' => $request->user()->id,
            'name' => $request->validated('name'),
            'list_id' => $listId,
            'overlay_preset' => $request->validated('overlay_preset'),
        ]);

        return redirect()->route('stream.show', [
            'current_team' => $current_team->slug,
            'session' => $session->id,
        ]);
    }

    /**
     * Show the control panel for a single stream session.
     */
    public function show(Request $request, Team $current_team, StreamSession $session): InertiaResponse
    {
        $this->authorizeManage($request, $current_team);
        $this->ensureBelongsToTeam($current_team, $session);

        $session->loadMissing(['list:id,name,color', 'currentQuestion.questionList:id,name,color']);

        $queue = $session->candidatesQuery()
            ->with('questionList:id,name,color')
            ->limit(8)
            ->get()
            ->map(QuestionPresenter::toArray(...))
            ->values();

        $addressed = $session->addressedQuestions()
            ->with('questionList:id,name,color')
            ->get()
            ->map(QuestionPresenter::toArray(...))
            ->values();

        $lists = $current_team->questionLists()
            ->orderBy('position')
            ->get(['id', 'name', 'color', 'position'])
            ->values();

        return Inertia::render('stream/show', [
            'team' => [
                'name' => $current_team->name,
                'slug' => $current_team->slug,
            ],
            'session' => $this->presentSession($session),
            'lists' => $lists,
            'queue' => $queue,
            'addressed' => $addressed,
            'history' => [],
            'permissions' => [
                'canManage' => $request->user()->hasTeamPermission($current_team, TeamPermission::ManageQuestions),
            ],
        ]);
    }

    /**
     * Update the session's editable settings.
     */
    public function update(UpdateSessionRequest $request, Team $current_team, StreamSession $session): RedirectResponse
    {
        $this->ensureBelongsToTeam($current_team, $session);

        $data = $request->validated();

        if (array_key_exists('list_id', $data)) {
            $data['list_id'] = $this->resolveListId($data['list_id'], $current_team);
        }

        $session->update($data);

        return back();
    }

    /**
     * Soft-delete the session.
     */
    public function destroy(Request $request, Team $current_team, StreamSession $session): RedirectResponse
    {
        $this->authorizeManage($request, $current_team);
        $this->ensureBelongsToTeam($current_team, $session);

        $session->delete();

        return redirect()->route('stream.index', ['current_team' => $current_team->slug]);
    }

    /**
     * Advance the session to the next candidate question.
     */
    public function next(Request $request, Team $current_team, StreamSession $session): RedirectResponse
    {
        $this->authorizeManage($request, $current_team);
        $this->ensureBelongsToTeam($current_team, $session);

        $next = $session->pickNext();

        $session->update([
            'current_question_id' => $next?->id,
        ]);

        return back();
    }

    /**
     * Set the current question to a specific question explicitly chosen by the operator.
     */
    public function showQuestion(Request $request, Team $current_team, StreamSession $session, Question $question): RedirectResponse
    {
        $this->authorizeManage($request, $current_team);
        $this->ensureBelongsToTeam($current_team, $session);

        abort_if($question->team_id !== $current_team->id, 404);

        $session->update([
            'current_question_id' => $question->id,
        ]);

        return back();
    }

    /**
     * Skip the current question (record it in skipped_question_ids) and advance.
     */
    public function skip(Request $request, Team $current_team, StreamSession $session): RedirectResponse
    {
        $this->authorizeManage($request, $current_team);
        $this->ensureBelongsToTeam($current_team, $session);

        $skipped = collect($session->skipped_question_ids ?? [])
            ->map(fn ($id) => (int) $id)
            ->all();

        if ($session->current_question_id !== null && ! in_array($session->current_question_id, $skipped, true)) {
            $skipped[] = $session->current_question_id;
        }

        $session->update([
            'skipped_question_ids' => array_values(array_unique($skipped)),
        ]);

        $next = $session->fresh()->pickNext();

        $session->update([
            'current_question_id' => $next?->id,
        ]);

        return back();
    }

    /**
     * Mark the session's current question as answered, then advance.
     */
    public function answer(AnswerSessionQuestionRequest $request, Team $current_team, StreamSession $session): RedirectResponse
    {
        $this->ensureBelongsToTeam($current_team, $session);

        abort_if($session->current_question_id === null, 422);

        $question = Question::query()
            ->where('id', $session->current_question_id)
            ->where('team_id', $current_team->id)
            ->first();

        abort_if($question === null, 404);

        $url = $request->validated('source_url');

        $question->update([
            'answer_source_url' => $url,
            'answer_source_label' => $request->validated('source_label'),
            'answer_source_type' => AnswerSourcePlatform::detect($url),
            'status' => QuestionStatus::Answered,
            'answered_at' => now(),
        ]);

        $next = $session->fresh()->pickNext();

        $session->update([
            'current_question_id' => $next?->id,
        ]);

        return back();
    }

    /**
     * Mark the current question as addressed (answered live, awaiting source URL) and advance.
     */
    public function address(Request $request, Team $current_team, StreamSession $session): RedirectResponse
    {
        $this->authorizeManage($request, $current_team);
        $this->ensureBelongsToTeam($current_team, $session);

        abort_if($session->current_question_id === null, 422);

        $question = Question::query()
            ->where('id', $session->current_question_id)
            ->where('team_id', $current_team->id)
            ->first();

        abort_if($question === null, 404);

        $question->update([
            'addressed_in_session_id' => $session->id,
            'addressed_at' => now(),
            'status' => QuestionStatus::Addressed,
        ]);

        $next = $session->fresh()->pickNext();

        $session->update([
            'current_question_id' => $next?->id,
        ]);

        return back();
    }

    /**
     * End the session: optionally bulk-apply a source URL to all still-pending
     * addressed questions, then mark the session inactive.
     */
    public function end(EndSessionRequest $request, Team $current_team, StreamSession $session): RedirectResponse
    {
        $this->ensureBelongsToTeam($current_team, $session);

        $url = $request->validated('source_url');
        $label = $request->validated('source_label');

        if ($url !== null && $url !== '') {
            $platform = AnswerSourcePlatform::detect($url);
            $now = now();

            DB::transaction(function () use ($session, $url, $label, $platform, $now): void {
                Question::query()
                    ->where('addressed_in_session_id', $session->id)
                    ->where('status', QuestionStatus::Addressed->value)
                    ->whereNull('answer_source_url')
                    ->update([
                        'answer_source_url' => $url,
                        'answer_source_label' => $label,
                        'answer_source_type' => $platform->value,
                        'status' => QuestionStatus::Answered->value,
                        'answered_at' => $now,
                    ]);
            });
        }

        $session->update([
            'is_active' => false,
            'current_question_id' => null,
        ]);

        return back();
    }

    /**
     * Apply a source URL to addressed questions of the session.
     *
     * If `question_ids` is provided, only those (still constrained to this
     * session) are touched. Works on both Addressed and Answered targets,
     * supporting retroactive overrides.
     */
    public function applySource(ApplySessionSourceRequest $request, Team $current_team, StreamSession $session): RedirectResponse
    {
        $this->ensureBelongsToTeam($current_team, $session);

        $url = $request->validated('source_url');
        $label = $request->validated('source_label');
        $questionIds = $request->validated('question_ids');
        $platform = AnswerSourcePlatform::detect($url);
        $now = now();

        DB::transaction(function () use ($session, $url, $label, $platform, $now, $questionIds): void {
            $query = Question::query()
                ->where('addressed_in_session_id', $session->id);

            if (is_array($questionIds) && ! empty($questionIds)) {
                $query->whereIn('id', $questionIds);
            }

            $query->update([
                'answer_source_url' => $url,
                'answer_source_label' => $label,
                'answer_source_type' => $platform->value,
                'status' => QuestionStatus::Answered->value,
                'answered_at' => $now,
            ]);
        });

        return back();
    }

    /**
     * Hide the overlay (clear current_question_id).
     */
    public function hide(Request $request, Team $current_team, StreamSession $session): RedirectResponse
    {
        $this->authorizeManage($request, $current_team);
        $this->ensureBelongsToTeam($current_team, $session);

        $session->update([
            'current_question_id' => null,
        ]);

        return back();
    }

    /**
     * Regenerate the public overlay secret token.
     */
    public function regenerateToken(Request $request, Team $current_team, StreamSession $session): RedirectResponse
    {
        $this->authorizeManage($request, $current_team);
        $this->ensureBelongsToTeam($current_team, $session);

        $session->regenerateToken();

        return back();
    }

    /**
     * Build the canonical session resource shape used by index and show.
     *
     * @return array<string, mixed>
     */
    protected function presentSession(StreamSession $session): array
    {
        return [
            'id' => $session->id,
            'name' => $session->name,
            'secret_token' => $session->secret_token,
            'list_id' => $session->list_id,
            'current_question_id' => $session->current_question_id,
            'overlay_preset' => $session->overlay_preset?->value,
            'is_active' => $session->is_active,
            'last_polled_at' => $session->last_polled_at?->toIso8601String(),
            'created_at' => $session->created_at->toIso8601String(),
            'list' => $session->list ? [
                'id' => $session->list->id,
                'name' => $session->list->name,
                'color' => $session->list->color,
            ] : null,
            'current_question' => $session->currentQuestion
                ? QuestionPresenter::toArray($session->currentQuestion)
                : null,
            'candidates_remaining' => $session->countCandidatesRemaining(),
            'overlay_url' => route('overlay.show', ['token' => $session->secret_token]),
        ];
    }

    /**
     * Validate that the supplied list (if any) belongs to the team.
     */
    protected function resolveListId(?int $listId, Team $team): ?int
    {
        if ($listId === null) {
            return null;
        }

        $belongs = $team->questionLists()->whereKey($listId)->exists();
        abort_if(! $belongs, 422);

        return $listId;
    }

    /**
     * Confirm the session belongs to the URL-bound team.
     */
    protected function ensureBelongsToTeam(Team $current_team, StreamSession $session): void
    {
        abort_if($session->team_id !== $current_team->id, 404);
    }

    /**
     * Authorize the user holds the manage-questions permission on the team.
     */
    protected function authorizeManage(Request $request, Team $team): void
    {
        abort_unless(
            $request->user()?->hasTeamPermission($team, TeamPermission::ManageQuestions) === true,
            403,
        );
    }
}
