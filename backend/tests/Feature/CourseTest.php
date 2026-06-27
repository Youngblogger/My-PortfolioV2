<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\PricingTier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_published_courses(): void
    {
        Course::factory()->count(3)->create(['is_published' => true]);

        $response = $this->getJson('/api/v1/courses');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_cannot_list_unpublished_courses(): void
    {
        Course::factory()->create(['is_published' => false]);

        $response = $this->getJson('/api/v1/courses');

        $response->assertJsonCount(0, 'data');
    }

    public function test_can_show_course_by_slug(): void
    {
        $course = Course::factory()->create([
            'slug' => 'test-course',
            'is_published' => true,
        ]);

        $response = $this->getJson('/api/v1/courses/test-course');

        $response->assertStatus(200)
            ->assertJsonPath('data.slug', 'test-course');
    }

    public function test_returns_404_for_nonexistent_slug(): void
    {
        $response = $this->getJson('/api/v1/courses/nonexistent');

        $response->assertStatus(404);
    }

    public function test_includes_modules_and_tiers_when_loaded(): void
    {
        $course = Course::factory()->create(['is_published' => true]);
        CourseModule::factory()->count(2)->create(['course_id' => $course->id]);
        PricingTier::factory()->count(2)->create(['course_id' => $course->id]);

        $response = $this->getJson('/api/v1/courses/' . $course->slug);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['modules', 'pricing_tiers'],
            ]);
    }

    public function test_can_filter_courses_by_stack(): void
    {
        Course::factory()->create(['stack_id' => 'fullstack', 'is_published' => true]);
        Course::factory()->create(['stack_id' => 'frontend', 'is_published' => true]);

        $response = $this->getJson('/api/v1/courses/stack/fullstack');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}
