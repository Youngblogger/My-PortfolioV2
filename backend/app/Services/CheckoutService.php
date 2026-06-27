<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Coupon;
use App\Models\Transaction;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Receipt;
use App\Models\PricingTier;
use App\Services\Payments\PaymentService;
use App\Services\EnrollmentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutService
{
    public function __construct(
        private PaymentService $paymentService,
        private EnrollmentService $enrollmentService,
    ) {}

    public function processCheckout(array $data, string $userId): array
    {
        return DB::transaction(function () use ($data, $userId) {
            $course = Course::findOrFail($data['course_id']);

            if (!$course->is_published) {
                throw new \RuntimeException('Course is not available for enrollment');
            }

            $tier = null;
            if (!empty($data['tier_id'])) {
                $tier = PricingTier::where('id', $data['tier_id'])
                    ->where('course_id', $course->id)
                    ->where('is_active', true)
                    ->firstOrFail();
            }

            $basePrice = $tier ? $tier->price_ngn : $course->price_ngn;
            $currency = $course->currency;

            $discountAmount = 0;
            $coupon = null;

            if (!empty($data['coupon_code'])) {
                $coupon = $this->validateCoupon($data['coupon_code'], $course->id, $basePrice);

                if ($coupon) {
                    $discountAmount = calculateDiscount(
                        $basePrice,
                        $coupon->discount_type,
                        $coupon->discount_value
                    );
                }
            }

            $subtotal = $basePrice - $discountAmount;
            $country = $data['billing']['country'] ?? null;
            $taxAmount = calculateTax($subtotal, $country);
            $grandTotal = $subtotal + $taxAmount;

            $reference = generateReference('PAY');

            $existingTransaction = Transaction::where('transaction_reference', $reference)->first();
            if ($existingTransaction) {
                throw new \RuntimeException('Duplicate transaction reference');
            }

            $callbackUrl = config('app.url') . '/academy/payment/processing?reference=' . $reference . '&gateway=' . $data['payment_gateway'];

            $providerData = [
                'email' => $data['billing']['email'],
                'amount' => $grandTotal,
                'currency' => $currency,
                'reference' => $reference,
                'callback_url' => $callbackUrl,
                'customer_name' => $data['billing']['full_name'] ?? '',
                'customer_phone' => $data['billing']['phone'] ?? '',
                'metadata' => [
                    'user_id' => $userId,
                    'course_id' => $course->id,
                    'tier_id' => $tier?->id,
                    'course_name' => $course->title,
                    'billing' => $data['billing'],
                    'coupon_code' => $data['coupon_code'] ?? null,
                    'discount_amount' => $discountAmount,
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                ],
            ];

            $paymentResult = $this->paymentService->initializePayment(
                $data['payment_gateway'],
                $providerData
            );

            Transaction::create([
                'user_id' => $userId,
                'transaction_reference' => $reference,
                'payment_gateway' => $data['payment_gateway'],
                'amount' => $grandTotal,
                'currency' => $currency,
                'status' => 'pending',
                'metadata' => array_merge($providerData['metadata'], [
                    'base_price' => $basePrice,
                    'discount_amount' => $discountAmount,
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'grand_total' => $grandTotal,
                    'tier_name' => $tier?->name,
                    'payment_gateway' => $data['payment_gateway'],
                    'billing' => $data['billing'],
                ]),
            ]);

            return [
                'reference' => $reference,
                'authorization_url' => $paymentResult['authorization_url'],
                'gateway' => $data['payment_gateway'],
            ];
        });
    }

    public function verifyAndComplete(string $reference, string $gateway): array
    {
        $transaction = Transaction::where('transaction_reference', $reference)->first();

        if (!$transaction) {
            throw new \RuntimeException('Transaction not found');
        }

        if ($transaction->status === 'completed') {
            $enrollment = Enrollment::where('id', $transaction->enrollment_id)->first();
            return [
                'status' => 'completed',
                'transaction' => $transaction,
                'enrollment' => $enrollment,
            ];
        }

        if ($transaction->status === 'failed' || $transaction->status === 'cancelled') {
            return [
                'status' => $transaction->status,
                'transaction' => $transaction,
                'enrollment' => null,
            ];
        }

        $verificationResult = $this->paymentService->verifyPayment($gateway, $reference);

        if ($verificationResult['status'] === 'pending') {
            $transaction->update(['status' => 'processing']);
            return [
                'status' => 'pending',
                'transaction' => $transaction->fresh(),
                'enrollment' => null,
            ];
        }

        if ($verificationResult['status'] !== 'completed') {
            $transaction->update([
                'status' => 'failed',
                'gateway_response' => $verificationResult['gateway_response'],
            ]);
            return [
                'status' => 'failed',
                'transaction' => $transaction->fresh(),
                'enrollment' => null,
            ];
        }

        $metadata = $transaction->metadata;
        $billing = $metadata['billing'] ?? [];

        $result = $this->enrollmentService->createFromTransaction(
            $transaction,
            $verificationResult,
            $billing
        );

        return [
            'status' => 'completed',
            'transaction' => $result['transaction'],
            'enrollment' => $result['enrollment'],
            'invoice' => $result['invoice'] ?? null,
            'receipt' => $result['receipt'] ?? null,
        ];
    }

    public function handleWebhook(string $gateway, array $payload, array $headers): array
    {
        $result = $this->paymentService->handleWebhook($gateway, $payload, $headers);

        if (!$result['success']) {
            return $result;
        }

        $reference = $result['reference'];

        $transaction = Transaction::where('transaction_reference', $reference)->first();
        if (!$transaction) {
            Log::warning('Webhook: transaction not found', ['reference' => $reference]);
            return ['received' => true];
        }

        if ($transaction->status === 'completed') {
            return ['received' => true];
        }

        $transaction->update([
            'status' => 'completed',
            'gateway_response' => $result['gateway_response'],
        ]);

        try {
            $metadata = $transaction->metadata;
            $billing = $metadata['billing'] ?? [];

            $this->enrollmentService->createFromTransaction(
                $transaction,
                $result,
                $billing
            );
        } catch (\Exception $e) {
            Log::error('Webhook: enrollment creation failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);
        }

        return ['received' => true];
    }

    private function validateCoupon(string $code, string $courseId, float $amount): ?Coupon
    {
        $coupon = Coupon::where('code', $code)
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return null;
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            $coupon->update(['is_active' => false]);
            return null;
        }

        if ($coupon->max_uses > 0 && $coupon->current_uses >= $coupon->max_uses) {
            return null;
        }

        if ($coupon->min_purchase > 0 && $amount < $coupon->min_purchase) {
            return null;
        }

        if ($coupon->course_id && $coupon->course_id !== $courseId) {
            return null;
        }

        return $coupon;
    }
}
