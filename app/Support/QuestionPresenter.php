<?php

namespace App\Support;

use App\Models\Question;

class QuestionPresenter
{
    /**
     * Transform a question into the canonical array shape used across the app.
     *
     * @return array{
     *     id: int,
     *     body: string,
     *     authorName: ?string,
     *     status: string,
     *     answerSource: ?array{url: string, label: ?string, platform: ?string},
     *     list: ?array{id: int, name: string, color: ?string},
     *     position: int,
     *     answeredAt: ?string,
     *     createdAt: string
     * }
     */
    public static function toArray(Question $question): array
    {
        return [
            'id' => $question->id,
            'body' => $question->body,
            'authorName' => $question->author_name,
            'status' => $question->status->value,
            'answerSource' => $question->answer_source_url ? [
                'url' => $question->answer_source_url,
                'label' => $question->answer_source_label,
                'platform' => $question->answer_source_type?->value,
            ] : null,
            'list' => $question->questionList ? [
                'id' => $question->questionList->id,
                'name' => $question->questionList->name,
                'color' => $question->questionList->color,
            ] : null,
            'position' => $question->position,
            'answeredAt' => $question->answered_at?->toIso8601String(),
            'createdAt' => $question->created_at->toIso8601String(),
        ];
    }
}
