<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Enums\PaymentStatus;
use App\Enums\PaymentGateway;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        return [
            'transaction_reference' => 'TXN-' . fake()->unique()->randomNumber(8),
            'payment_gateway' => fake()->randomElement([PaymentGateway::PAYSTACK, PaymentGateway::FLUTTERWAVE]),
            'amount' => fake()->randomFloat(2, 5000, 200000),
            'currency' => 'NGN',
            'status' => PaymentStatus::PENDING,
            'gateway_response' => null,
            'paid_at' => null,
            'metadata' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn() => [
            'status' => PaymentStatus::COMPLETED,
            'paid_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn() => ['status' => PaymentStatus::FAILED]);
    }
}
