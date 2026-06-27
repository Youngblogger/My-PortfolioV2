<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfileFactory extends Factory
{
    protected $model = Profile::class;

    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'avatar_url' => null,
            'phone' => fake()->phoneNumber(),
            'country' => fake()->country(),
            'role' => 'student',
            'bio' => fake()->sentence(),
            'title' => fake()->jobTitle(),
        ];
    }
}
