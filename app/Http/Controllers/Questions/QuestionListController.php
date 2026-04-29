<?php

namespace App\Http\Controllers\Questions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Questions\ReorderQuestionListsRequest;
use App\Http\Requests\Questions\StoreQuestionListRequest;
use App\Http\Requests\Questions\UpdateQuestionListRequest;
use App\Models\QuestionList;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class QuestionListController extends Controller
{
    /**
     * Create a new question list for the team.
     */
    public function store(StoreQuestionListRequest $request, Team $current_team): RedirectResponse
    {
        Gate::authorize('create', [QuestionList::class, $current_team]);

        $maxPosition = (int) $current_team->questionLists()->max('position');

        $current_team->questionLists()->create([
            'name' => $request->validated('name'),
            'color' => $request->validated('color'),
            'position' => $maxPosition + 1,
        ]);

        return back();
    }

    /**
     * Update an existing question list.
     */
    public function update(UpdateQuestionListRequest $request, Team $current_team, QuestionList $list): RedirectResponse
    {
        $this->ensureBelongsToTeam($current_team, $list);

        Gate::authorize('update', $list);

        $list->update($request->validated());

        return back();
    }

    /**
     * Delete a question list, detaching its questions instead of cascading.
     */
    public function destroy(Team $current_team, QuestionList $list): RedirectResponse
    {
        $this->ensureBelongsToTeam($current_team, $list);

        Gate::authorize('delete', $list);

        DB::transaction(function () use ($list): void {
            $list->questions()->update(['question_list_id' => null]);
            $list->delete();
        });

        return back();
    }

    /**
     * Reorder all question lists for the team. Returns `back()` rather
     * than 204 No Content so Inertia v3 doesn't treat the response as a
     * non-Inertia render and surface an empty fullscreen modal. The
     * frontend already passes `only: []` so no props are refreshed.
     */
    public function reorder(ReorderQuestionListsRequest $request, Team $current_team): RedirectResponse
    {
        /** @var array<int, int> $ids */
        $ids = $request->validated('ids');

        $teamListIds = $current_team->questionLists()->whereIn('id', $ids)->pluck('id');
        abort_if($teamListIds->count() !== count(array_unique($ids)), 422);

        DB::transaction(function () use ($ids): void {
            foreach ($ids as $position => $id) {
                QuestionList::where('id', $id)->update(['position' => $position]);
            }
        });

        return back();
    }

    /**
     * Confirm the list belongs to the URL-bound team.
     */
    protected function ensureBelongsToTeam(Team $current_team, QuestionList $list): void
    {
        abort_if($list->team_id !== $current_team->id, 404);
    }
}
