<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Transaction;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Receipt;
use App\Models\Coupon;
use App\Services\Payments\PaymentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EnrollmentService
{
    public function __construct(
        private EmailService $emailService,
    ) {}

    public function createFreeEnrollment(string $userId, string $courseId, ?string $tierId, array $billing): Enrollment
    {
        return DB::transaction(function () use ($userId, $courseId, $tierId, $billing) {
            $course = Course::findOrFail($courseId);

            $existing = Enrollment::where('user_id', $userId)
                ->where('course_id', $courseId)
                ->first();

            if ($existing) {
                throw new \RuntimeException('Already enrolled in this course', 409);
            }

            $enrollmentNumber = generateEnrollmentNumber();

            $enrollment = Enrollment::create([
                'user_id' => $userId,
                'course_id' => $courseId,
                'tier_id' => $tierId,
                'enrollment_number' => $enrollmentNumber,
                'status' => 'active',
                'started_at' => now(),
            ]);

            $course->increment('students_enrolled');

            try {
                $this->emailService->sendEnrollmentConfirmation($enrollment, $course, $billing);
            } catch (\Exception $e) {
                Log::error('Failed to send enrollment confirmation email', [
                    'enrollment_id' => $enrollment->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return $enrollment;
        });
    }

    public function createFromTransaction(
        Transaction $transaction,
        array $verificationResult,
        array $billing
    ): array {
        return DB::transaction(function () use ($transaction, $verificationResult, $billing) {
            $metadata = $transaction->metadata;
            $course = Course::findOrFail($metadata['course_id']);

            $existingEnrollment = Enrollment::where('user_id', $transaction->user_id)
                ->where('course_id', $course->id)
                ->first();

            if ($existingEnrollment) {
                $transaction->update([
                    'enrollment_id' => $existingEnrollment->id,
                    'status' => 'completed',
                ]);
                return [
                    'transaction' => $transaction->fresh(),
                    'enrollment' => $existingEnrollment,
                ];
            }

            $enrollmentNumber = generateEnrollmentNumber();

            $enrollment = Enrollment::create([
                'user_id' => $transaction->user_id,
                'course_id' => $course->id,
                'tier_id' => $metadata['tier_id'] ?? null,
                'enrollment_number' => $enrollmentNumber,
                'status' => 'active',
                'started_at' => now(),
                'metadata' => $metadata,
            ]);

            $course->increment('students_enrolled');

            $transaction->update([
                'enrollment_id' => $enrollment->id,
                'status' => 'completed',
            ]);

            $profile = $transaction->user;

            $invoiceNumber = generateInvoiceNumber();
            $receiptNumber = generateReceiptNumber();

            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'user_id' => $transaction->user_id,
                'enrollment_id' => $enrollment->id,
                'transaction_id' => $transaction->id,
                'course_name' => $course->title,
                'student_name' => $billing['full_name'] ?? $profile->full_name ?? 'Student',
                'student_email' => $billing['email'] ?? $profile->email,
                'payment_gateway' => $transaction->payment_gateway,
                'payment_method' => $verificationResult['gateway_response']['channel'] ?? null,
                'subtotal' => $metadata['subtotal'] ?? $transaction->amount,
                'discount_amount' => $metadata['discount_amount'] ?? 0,
                'discount_code' => $metadata['coupon_code'] ?? null,
                'tax_amount' => $metadata['tax_amount'] ?? 0,
                'tax_rate' => 0.075,
                'grand_total' => $transaction->amount,
                'currency' => $transaction->currency,
                'status' => 'completed',
                'paid_at' => now(),
            ]);

            $receipt = Receipt::create([
                'receipt_number' => $receiptNumber,
                'transaction_reference' => $transaction->transaction_reference,
                'user_id' => $transaction->user_id,
                'enrollment_id' => $enrollment->id,
                'invoice_id' => $invoice->id,
                'course_name' => $course->title,
                'student_name' => $billing['full_name'] ?? $profile->full_name ?? 'Student',
                'amount' => $transaction->amount,
                'payment_gateway' => $transaction->payment_gateway,
                'payment_method' => $verificationResult['gateway_response']['channel'] ?? null,
                'currency' => $transaction->currency,
                'status' => 'completed',
                'receipt_data' => $verificationResult['gateway_response'],
            ]);

            if (!empty($metadata['coupon_code'])) {
                Coupon::where('code', $metadata['coupon_code'])->increment('current_uses');
            }

            try {
                $this->emailService->sendEnrollmentConfirmation($enrollment, $course, $billing);
                $this->emailService->sendPaymentReceipt($receipt, $course, $profile);
                $this->emailService->sendInvoice($invoice, $course, $profile);
            } catch (\Exception $e) {
                Log::error('Failed to send confirmation emails', [
                    'enrollment_id' => $enrollment->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return [
                'transaction' => $transaction->fresh(),
                'enrollment' => $enrollment,
                'invoice' => $invoice,
                'receipt' => $receipt,
            ];
        });
    }
}
