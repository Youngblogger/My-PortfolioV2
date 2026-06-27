<?php

namespace Database\Factories;

use App\Models\CourseModule;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseModuleFactory extends Factory
{
    protected $model = CourseModule::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'sort_order' => fake()->numberBetween(1, 20),
            'lessons' => [
                ['title' => fake()->sentence(), 'duration' => '10:00', 'video_url' => null],
                ['title' => fake()->sentence(), 'duration' => '15:00', 'video_url' => null],
            ],
        ];
    }
}
