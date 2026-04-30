<?php

namespace App\Http\Requests\Faq;

use App\Models\Team;
use App\Support\ContentFilter;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Sanitize input before validation.
     */
    protected function prepareForValidation(): void
    {
        $body = $this->input('body');
        $authorName = $this->input('author_name');

        $this->merge([
            'body' => is_string($body) ? trim(strip_tags($body)) : $body,
            'author_name' => is_string($authorName) ? trim(strip_tags($authorName)) : $authorName,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'min:5', 'max:1000'],
            'author_name' => ['nullable', 'string', 'max:80'],
        ];
    }

    /**
     * Apply the content filter after the basic rules pass. The filter blocks
     * the submission with a generic message — the offending word is never
     * exposed to the visitor.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            /** @var Team|null $team */
            $team = $this->route('team');
            if (! $team instanceof Team) {
                return;
            }

            $filter = app(ContentFilter::class);

            $body = (string) $this->input('body', '');
            if ($body !== '' && $filter->check($body, $team) !== null) {
                $v->errors()->add('body', __('Votre question contient du contenu non autorisé.'));
            }

            $name = (string) $this->input('author_name', '');
            if ($name !== '' && $filter->check($name, $team) !== null) {
                $v->errors()->add('author_name', __('Ce nom n\'est pas autorisé.'));
            }
        });
    }
}
