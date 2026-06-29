<?php

namespace App\Http\Requests\Api;

use App\Models\ServiceOrder;
use Illuminate\Foundation\Http\FormRequest;

class StoreProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->user()?->profile?->role === 'admin') {
            return true;
        }

        $orderId = $this->input('service_order_id');

        return $orderId && ServiceOrder::where('id', $orderId)
            ->where('user_id', $this->user()?->id)
            ->exists();
    }

    public function rules(): array
    {
        return [
            'service_order_id' => ['required', 'exists:service_orders,id'],
            'scope_of_work' => ['required', 'string'],
            'deliverables' => ['required', 'array'],
            'deliverables.*' => ['required', 'string'],
            'timeline_description' => ['required', 'string'],
            'total_ngn' => ['required', 'numeric', 'min:0'],
            'valid_until' => ['nullable', 'date', 'after:today'],
            'included_features' => ['nullable', 'array'],
            'excluded_items' => ['nullable', 'array'],
            'milestones' => ['nullable', 'array'],
            'payment_schedule' => ['nullable', 'array'],
            'terms_and_conditions' => ['nullable', 'array'],
            'total_usd' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
