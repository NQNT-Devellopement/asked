<?php

namespace Database\Factories;

use App\Enums\OverlayPreset;
use App\Models\StreamSession;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<StreamSession>
 */
class StreamSessionFactory extends Factory
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
            'created_by_user_id' => User::factory(),
            'name' => fake()->words(2, true),
            'secret_token' => Str::random(64),
            'list_id' => null,
            'current_question_id' => null,
            'skipped_question_ids' => [],
            'overlay_preset' => OverlayPreset::Editorial->value,
            'is_active' => true,
            'last_polled_at' => null,
        ];
    }

    /**
     * Indicate that the session is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
