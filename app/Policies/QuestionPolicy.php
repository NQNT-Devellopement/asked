<?php

namespace App\Policies;

use App\Enums\TeamPermission;
use App\Models\Question;
use App\Models\Team;
use App\Models\User;

class QuestionPolicy
{
    /**
     * Determine whether the user can view any of the team's questions.
     */
    public function viewAny(User $user, Team $team): bool
    {
        return $user->hasTeamPermission($team, TeamPermission::ManageQuestions);
    }

    /**
     * Determine whether the user can update the question.
     */
    public function update(User $user, Question $question): bool
    {
        return $user->hasTeamPermission($question->team, TeamPermission::ManageQuestions);
    }

    /**
     * Determine whether the user can delete the question.
     */
    public function delete(User $user, Question $question): bool
    {
        return $user->hasTeamPermission($question->team, TeamPermission::ManageQuestions);
    }

    /**
     * Determine whether the user can moderate the question.
     */
    public function moderate(User $user, Question $question): bool
    {
        return $user->hasTeamPermission($question->team, TeamPermission::ModerateQuestions);
    }
}
