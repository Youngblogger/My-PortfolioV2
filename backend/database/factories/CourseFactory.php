<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);

        return [
            'slug' => Str::slug($title),
            'stack_id' => fake()->randomElement(['frontend', 'backend', 'fullstack', 'mobile', 'devops']),
            'title' => $title,
            'subtitle' => fake()->sentence(),
            'description' => fake()->paragraphs(3, true),
            'short_description' => fake()->sentence(),
            'category' => fake()->randomElement(['programming', 'design', 'data-science', 'devops']),
            'icon' => null,
            'thumbnail_url' => null,
            'cover_url' => null,
            'instructor_name' => fake()->name(),
            'instructor_title' => fake()->jobTitle(),
            'instructor_avatar' => null,
            'instructor_bio' => fake()->paragraph(),
            'instructor_experience' => fake()->numberBetween(3, 20) . ' years',
            'instructor_students' => fake()->numberBetween(100, 50000),
            'instructor_rating' => fake()->randomFloat(1, 3.5, 5.0),
            'duration' => fake()->randomElement(['6 weeks', '8 weeks', '12 weeks', '3 months', '6 months']),
            'skill_level' => fake()->randomElement(['beginner', 'intermediate', 'advanced', 'all-levels']),
            'language' => 'English',
            'certificate_included' => true,
            'lifetime_access' => true,
            'price_ngn' => fake()->randomFloat(2, 10000, 200000),
            'price_usd' => fake()->randomFloat(2, 10, 200),
            'original_price_ngn' => null,
            'original_price_usd' => null,
            'discount_percentage' => null,
            'currency' => 'NGN',
            'is_free' => false,
            'is_published' => false,
            'average_rating' => 0,
            'total_reviews' => 0,
            'students_enrolled' => 0,
            'what_you_learn' => [fake()->sentence(), fake()->sentence(), fake()->sentence()],
            'includes' => [fake()->sentence(), fake()->sentence()],
            'requirements' => [fake()->sentence(), fake()->sentence()],
            'metadata' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn() => ['is_published' => true]);
    }

    public function free(): static
    {
        return $this->state(fn() => [
            'is_free' => true,
            'price_ngn' => 0,
            'price_usd' => 0,
        ]);
    }
}
