<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Profile;
use App\Models\Course;
use App\Models\Transaction;
use App\Models\Enrollment;
use App\Enums\PaymentStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Http;

class PaymentTest extends TestCase
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
            'price_ngn' => 50000,
        ]);
    }

    public function test_can_initialize_payment(): void
    {
        Http::fake([
            'api.paystack.co/transaction/initialize' => Http::response([
                'status' => true,
                'data' => [
                    'authorization_url' => 'https://paystack.com/checkout/ref',
                    'reference' => 'REF-123',
                    'access_code' => 'acc_123',
                ],
            ], 200),
        ]);

        $response = $this->withToken($this->token)
            ->postJson('/api/v1/payments/initialize', [
                'course_id' => $this->course->id,
                'payment_gateway' => 'paystack',
                'currency' => 'NGN',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['authorization_url', 'reference'],
            ]);
    }

    public function test_can_verify_payment(): void
    {
        $transaction = Transaction::factory()->create([
            'user_id' => $this->user->id,
            'transaction_reference' => 'REF-VERIFY',
            'status' => PaymentStatus::PENDING,
            'amount' => 50000,
            'currency' => 'NGN',
            'payment_gateway' => 'paystack',
        ]);

        Http::fake([
            'api.paystack.co/transaction/verify/REF-VERIFY' => Http::response([
                'status' => true,
                'data' => [
                    'status' => 'success',
                    'reference' => 'REF-VERIFY',
                    'amount' => 5000000,
                    'currency' => 'NGN',
                    'gateway_response' => 'Successful',
                    'paid_at' => now()->toIso8601String(),
                    'channel' => 'card',
                ],
            ], 200),
        ]);

        $response = $this->withToken($this->token)
            ->getJson('/api/v1/payments/verify?reference=REF-VERIFY');

        $response->assertStatus(200);

        $this->assertDatabaseHas('transactions', [
            'transaction_reference' => 'REF-VERIFY',
            'status' => PaymentStatus::COMPLETED,
        ]);
    }

    public function test_paystack_webhook_handles_successful_charge(): void
    {
        $enrollment = Enrollment::factory()->create([
            'user_id' => $this->user->id,
            'course_id' => $this->course->id,
            'status' => 'pending',
        ]);

        Transaction::factory()->create([
            'user_id' => $this->user->id,
            'enrollment_id' => $enrollment->id,
            'transaction_reference' => 'WEBHOOK-REF',
            'status' => PaymentStatus::PENDING,
            'amount' => 50000,
            'currency' => 'NGN',
            'payment_gateway' => 'paystack',
        ]);

        $payload = [
            'event' => 'charge.success',
            'data' => [
                'reference' => 'WEBHOOK-REF',
                'status' => 'success',
                'amount' => 5000000,
                'currency' => 'NGN',
                'gateway_response' => 'Successful',
                'paid_at' => now()->toIso8601String(),
                'channel' => 'card',
                'customer' => ['email' => $this->user->email],
            ],
        ];

        $response = $this->postJson('/api/v1/payments/webhook/paystack', $payload, [
            'X-Paystack-Signature' => hash_hmac('sha512', json_encode($payload), config('services.paystack.secret_key')),
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('transactions', [
            'transaction_reference' => 'WEBHOOK-REF',
            'status' => PaymentStatus::COMPLETED,
        ]);
    }
}
