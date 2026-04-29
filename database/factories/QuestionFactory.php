<?php

namespace Database\Factories;

use App\Enums\AnswerSourcePlatform;
use App\Enums\QuestionStatus;
use App\Models\Question;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'question_list_id' => null,
            'author_name' => fake()->boolean() ? fake()->name() : null,
            'body' => fake()->paragraph(),
            'status' => QuestionStatus::Pending,
            'answer_source_type' => null,
            'answer_source_url' => null,
            'answer_source_label' => null,
            'answered_at' => null,
            'position' => 0,
            'submitter_ip_hash' => null,
        ];
    }

    /**
     * Indicate that the question has been approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => QuestionStatus::Approved,
        ]);
    }

    /**
     * Indicate that the question has been answered.
     */
    public function answered(): static
    {
        return $this->state(function (array $attributes) {
            $samples = [
                AnswerSourcePlatform::YouTube->value => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                AnswerSourcePlatform::Twitch->value => 'https://www.twitch.tv/videos/123456789',
                AnswerSourcePlatform::Twitter->value => 'https://x.com/example/status/1234567890',
                AnswerSourcePlatform::TikTok->value => 'https://www.tiktok.com/@example/video/1234567890',
                AnswerSourcePlatform::Instagram->value => 'https://www.instagram.com/p/Cabcdef/',
                AnswerSourcePlatform::Spotify->value => 'https://open.spotify.com/episode/abcdef',
                AnswerSourcePlatform::Website->value => 'https://example.com/post/answer',
            ];

            $platform = fake()->randomElement(AnswerSourcePlatform::cases());

            return [
                'status' => QuestionStatus::Answered,
                'answered_at' => now(),
                'answer_source_type' => $platform,
                'answer_source_url' => $samples[$platform->value],
                'answer_source_label' => fake()->sentence(4),
            ];
        });
    }

    /**
     * Indicate that the question has been rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => QuestionStatus::Rejected,
        ]);
    }
}
