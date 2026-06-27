<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['required', 'string', 'exists:courses,id'],
            'tier_id' => ['nullable', 'string', 'exists:pricing_tiers,id'],
            'payment_gateway' => ['required', 'string', 'in:paystack,flutterwave'],
            'currency' => ['required', 'string', 'in:NGN,USD'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'billing' => ['nullable', 'array'],
            'billing.full_name' => ['required_with:billing', 'string', 'max:255'],
            'billing.email' => ['required_with:billing', 'email', 'max:255'],
            'billing.phone' => ['nullable', 'string', 'max:50'],
            'billing.address' => ['nullable', 'string', 'max:500'],
            'billing.city' => ['nullable', 'string', 'max:100'],
            'billing.state' => ['nullable', 'string', 'max:100'],
            'billing.country' => ['nullable', 'string', 'max:100'],
        ];
    }
}
