<?php

namespace App\Policies;

use App\Enums\TeamPermission;
use App\Models\QuestionList;
use App\Models\Team;
use App\Models\User;

class QuestionListPolicy
{
    /**
     * Determine whether the user can view any of the team's question lists.
     */
    public function viewAny(User $user, Team $team): bool
    {
        return $user->hasTeamPermission($team, TeamPermission::ManageQuestions);
    }

    /**
     * Determine whether the user can view the question list.
     */
    public function view(User $user, QuestionList $questionList): bool
    {
        return $user->hasTeamPermission($questionList->team, TeamPermission::ManageQuestions);
    }

    /**
     * Determine whether the user can create a question list for the team.
     */
    public function create(User $user, Team $team): bool
    {
        return $user->hasTeamPermission($team, TeamPermission::ManageQuestions);
    }

    /**
     * Determine whether the user can update the question list.
     */
    public function update(User $user, QuestionList $questionList): bool
    {
        return $user->hasTeamPermission($questionList->team, TeamPermission::ManageQuestions);
    }

    /**
     * Determine whether the user can delete the question list.
     */
    public function delete(User $user, QuestionList $questionList): bool
    {
        return $user->hasTeamPermission($questionList->team, TeamPermission::ManageQuestions);
    }
}
