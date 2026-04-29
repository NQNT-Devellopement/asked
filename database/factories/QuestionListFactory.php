<?php

namespace Database\Factories;

use App\Models\QuestionList;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuestionList>
 */
class QuestionListFactory extends Factory
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
            'name' => fake()->words(2, true),
            'color' => fake()->randomElement(['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']),
            'position' => 0,
        ];
    }
}
