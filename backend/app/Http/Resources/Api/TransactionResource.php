<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'enrollment_id' => $this->enrollment_id,
            'transaction_reference' => $this->transaction_reference,
            'payment_gateway' => $this->payment_gateway,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
