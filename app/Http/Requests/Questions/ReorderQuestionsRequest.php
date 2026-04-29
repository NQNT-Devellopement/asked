<?php

namespace App\Http\Requests\Questions;

use App\Enums\TeamPermission;
use App\Models\Team;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReorderQuestionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $team = $this->route('current_team');

        return $team instanceof Team
            && $this->user()?->hasTeamPermission($team, TeamPermission::ManageQuestions) === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'max:200'],
            'items.*.id' => ['required', 'integer', 'min:1'],
            'items.*.list_id' => ['nullable', 'integer', 'min:1'],
            'items.*.position' => ['required', 'integer', 'min:0'],
        ];
    }
}
