<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'user_id' => $this->user_id,
            'enrollment_id' => $this->enrollment_id,
            'transaction_id' => $this->transaction_id,
            'course_name' => $this->course_name,
            'student_name' => $this->student_name,
            'student_email' => $this->student_email,
            'payment_gateway' => $this->payment_gateway,
            'payment_method' => $this->payment_method,
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'discount_code' => $this->discount_code,
            'tax_amount' => (float) $this->tax_amount,
            'tax_rate' => (float) $this->tax_rate,
            'grand_total' => (float) $this->grand_total,
            'currency' => $this->currency,
            'status' => $this->status,
            'paid_at' => $this->paid_at,
            'created_at' => $this->created_at,
        ];
    }
}
