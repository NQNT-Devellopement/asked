<?php

namespace App\Http\Requests\Teams;

use App\Enums\TeamPermission;
use App\Models\Team;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateModerationSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Team|null $team */
        $team = $this->route('team');
        $user = $this->user();

        return $team instanceof Team
            && $user !== null
            && $user->hasTeamPermission($team, TeamPermission::ManageModeration);
    }

    /**
     * Trim, lowercase, and dedupe before validation. We store the input form
     * as typed (preserving diacritics/digits) — full normalization (ASCII +
     * leetspeak) is applied at read time by ContentFilter::teamWords().
     */
    protected function prepareForValidation(): void
    {
        $words = $this->input('words', []);
        if (! is_array($words)) {
            $words = [];
        }

        $clean = [];
        foreach ($words as $word) {
            if (! is_string($word)) {
                continue;
            }
            $word = mb_strtolower(trim($word));
            if ($word === '') {
                continue;
            }
            $clean[$word] = true;
        }

        $this->merge(['words' => array_keys($clean)]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'words' => ['array', 'max:200'],
            'words.*' => ['string', 'min:2', 'max:50'],
        ];
    }
}
