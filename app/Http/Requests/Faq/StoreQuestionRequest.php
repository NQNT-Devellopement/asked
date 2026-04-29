<?php

namespace App\Http\Requests\Faq;

use Illuminate\Contracts\Validation\ValidationRule;
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
}
