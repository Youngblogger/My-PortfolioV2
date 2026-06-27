<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Receipt;
use App\Models\Course;
use App\Models\Profile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailService
{
    public function sendEnrollmentConfirmation(Enrollment $enrollment, Course $course, array $billing): void
    {
        $profile = Profile::find($enrollment->user_id);
        if (!$profile) return;

        $data = [
            'student_name' => $billing['full_name'] ?? $profile->full_name ?? 'Student',
            'course_name' => $course->title,
            'enrollment_number' => $enrollment->enrollment_number,
            'dashboard_url' => config('app.url') . '/academy/dashboard',
            'course_url' => config('app.url') . '/academy/' . $course->slug,
            'amount' => number_format($billing['amount'] ?? 0, 2),
        ];

        Mail::send('emails.enrollment-confirmation', $data, function ($message) use ($profile, $course) {
            $message->to($profile->email, $profile->full_name)
                ->subject('Welcome to ' . $course->title . ' - CODEMAFIA Academy');
        });
    }

    public function sendPaymentReceipt(Receipt $receipt, Course $course, Profile $profile): void
    {
        $data = [
            'student_name' => $receipt->student_name,
            'course_name' => $course->title,
            'amount' => number_format($receipt->amount, 2),
            'currency' => $receipt->currency,
            'reference' => $receipt->transaction_reference,
            'receipt_number' => $receipt->receipt_number,
            'date' => $receipt->created_at->format('F j, Y'),
            'receipt_url' => config('app.url') . '/academy/receipt/' . $receipt->id,
        ];

        Mail::send('emails.payment-receipt', $data, function ($message) use ($profile) {
            $message->to($profile->email, $profile->full_name)
                ->subject('Payment Receipt - CODEMAFIA Academy');
        });
    }

    public function sendInvoice(Invoice $invoice, Course $course, Profile $profile): void
    {
        $data = [
            'student_name' => $invoice->student_name,
            'course_name' => $course->title,
            'invoice_number' => $invoice->invoice_number,
            'amount' => number_format($invoice->grand_total, 2),
            'currency' => $invoice->currency,
            'date' => $invoice->created_at->format('F j, Y'),
            'invoice_url' => config('app.url') . '/academy/invoice/' . $invoice->id,
        ];

        Mail::send('emails.invoice', $data, function ($message) use ($profile) {
            $message->to($profile->email, $profile->full_name)
                ->subject('Invoice - CODEMAFIA Academy');
        });
    }

    public function sendContactForm(array $data): void
    {
        Mail::send('emails.contact', $data, function ($message) use ($data) {
            $message->to(config('services.contact_email'))
                ->subject('Contact Form: ' . ($data['subject'] ?? 'General Inquiry'));
        });
    }

    public function sendQuoteRequest(array $data): void
    {
        Mail::send('emails.quote-request', $data, function ($message) use ($data) {
            $message->to(config('services.contact_email'))
                ->subject('Quote Request: ' . ($data['service'] ?? 'General'));
        });
    }
}
