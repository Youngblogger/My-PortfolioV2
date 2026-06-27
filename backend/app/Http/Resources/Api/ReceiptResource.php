<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'receipt_number' => $this->receipt_number,
            'transaction_reference' => $this->transaction_reference,
            'user_id' => $this->user_id,
            'enrollment_id' => $this->enrollment_id,
            'invoice_id' => $this->invoice_id,
            'course_name' => $this->course_name,
            'student_name' => $this->student_name,
            'amount' => (float) $this->amount,
            'payment_gateway' => $this->payment_gateway,
            'payment_method' => $this->payment_method,
            'currency' => $this->currency,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
