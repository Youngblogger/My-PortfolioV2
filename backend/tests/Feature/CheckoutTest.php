<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Profile;
use App\Models\Course;
use App\Models\PricingTier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;
    private Course $course;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        Profile::factory()->create(['id' => $this->user->id]);
        $this->token = $this->user->createToken('test')->plainTextToken;

        $this->course = Course::factory()->create([
            'is_published' => true,
            'is_free' => false,
            'price_ngn' => 50000,
            'price_usd' => 50,
        ]);
    }

    public function test_can_checkout_with_valid_data(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/v1/checkout', [
                'course_id' => $this->course->id,
                'payment_gateway' => 'paystack',
                'currency' => 'NGN',
                'billing' => [
                    'full_name' => 'Test User',
                    'email' => 'test@example.com',
                ],
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['authorization_url', 'reference', 'access_code'],
            ]);
    }

    public function test_can_checkout_with_tier(): void
    {
        $tier = PricingTier::factory()->create([
            'course_id' => $this->course->id,
            'price_ngn' => 75000,
            'is_active' => true,
        ]);

        $response = $this->withToken($this->token)
            ->postJson('/api/v1/checkout', [
                'course_id' => $this->course->id,
                'tier_id' => $tier->id,
                'payment_gateway' => 'paystack',
                'currency' => 'NGN',
                'billing' => [
                    'full_name' => 'Test User',
                    'email' => 'test@example.com',
                ],
            ]);

        $response->assertStatus(200);
    }

    public function test_cannot_checkout_without_auth(): void
    {
        $response = $this->postJson('/api/v1/checkout', [
            'course_id' => $this->course->id,
            'payment_gateway' => 'paystack',
            'currency' => 'NGN',
        ]);

        $response->assertStatus(401);
    }

    public function test_cannot_checkout_with_invalid_course(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/v1/checkout', [
                'course_id' => 'invalid-id',
                'payment_gateway' => 'paystack',
                'currency' => 'NGN',
            ]);

        $response->assertStatus(422);
    }
}
