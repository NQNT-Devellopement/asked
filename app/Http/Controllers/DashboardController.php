<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Enums\TeamPermission;
use App\Models\Question;
use App\Models\Team;
use App\Support\QuestionPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the editorial morning brief — counts, latest dispatches, and
     * the receipt for the team's public FAQ page.
     */
    public function __invoke(Request $request, Team $current_team): Response
    {
        $user = $request->user();

        $statusCounts = $current_team->questions()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $listsCount = $current_team->questionLists()->count();

        $recent = $current_team->questions()
            ->whereIn('status', [
                QuestionStatus::Pending->value,
                QuestionStatus::Approved->value,
                QuestionStatus::Answered->value,
            ])
            ->orderByDesc('created_at')
            ->with('questionList:id,name,color')
            ->limit(5)
            ->get()
            ->map(QuestionPresenter::toArray(...))
            ->values();

        return Inertia::render('dashboard', [
            'team' => [
                'id' => $current_team->id,
                'name' => $current_team->name,
                'slug' => $current_team->slug,
            ],
            'publicUrl' => route('faq.show', $current_team),
            'counts' => [
                'pending' => (int) ($statusCounts[QuestionStatus::Pending->value] ?? 0),
                'approved' => (int) ($statusCounts[QuestionStatus::Approved->value] ?? 0),
                'answered' => (int) ($statusCounts[QuestionStatus::Answered->value] ?? 0),
                'lists' => $listsCount,
            ],
            'recent' => $recent,
            'permissions' => [
                'canManageQuestions' => $user->hasTeamPermission($current_team, TeamPermission::ManageQuestions),
                'canModerate' => $user->hasTeamPermission($current_team, TeamPermission::ModerateQuestions),
                'canCustomize' => $user->hasTeamPermission($current_team, TeamPermission::CustomizePage),
            ],
        ]);
    }
}
