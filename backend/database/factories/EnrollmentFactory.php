<?php

namespace Database\Factories;

use App\Models\Enrollment;
use App\Enums\EnrollmentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    public function definition(): array
    {
        return [
            'enrollment_number' => 'ENR-' . fake()->unique()->randomNumber(8),
            'status' => EnrollmentStatus::ACTIVE,
            'progress' => 0,
            'certificate_url' => null,
            'started_at' => now(),
            'completed_at' => null,
            'metadata' => [
                'billing' => ['full_name' => fake()->name(), 'email' => fake()->email()],
            ],
        ];
    }
}
