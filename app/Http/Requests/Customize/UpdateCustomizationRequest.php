<?php

namespace App\Http\Requests\Customize;

use App\Enums\FaqBackground;
use App\Enums\FaqTemplate;
use App\Enums\TeamPermission;
use App\Models\Team;
use App\Rules\TeamName;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomizationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $team = $this->route('current_team');

        return $team instanceof Team
            && $this->user()?->hasTeamPermission($team, TeamPermission::CustomizePage) === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255', new TeamName],
            'headline' => ['sometimes', 'nullable', 'string', 'max:80'],
            'tagline' => ['sometimes', 'nullable', 'string', 'max:280'],
            'template' => ['required', Rule::enum(FaqTemplate::class)],
            'theme' => ['sometimes', 'array'],
            'theme.accent' => ['required_with:theme', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'theme.background' => ['required_with:theme', Rule::enum(FaqBackground::class)],
        ];
    }
}
