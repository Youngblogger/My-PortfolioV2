<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id' => ['required', 'exists:services,id'],
            'project_type_id' => ['required', 'exists:project_types,id'],
            'package_id' => ['required', 'exists:packages,id'],
            'add_on_ids' => ['nullable', 'array'],
            'add_on_ids.*' => ['string', 'exists:add_ons,id'],
            'payment_gateway' => ['required', 'string', 'in:paystack,flutterwave'],
            'payment_type' => ['required', 'string', 'in:full,deposit'],
            'billing' => ['required', 'array'],
            'billing.full_name' => ['required', 'string'],
            'billing.email' => ['required', 'email'],
            'billing.phone' => ['nullable', 'string'],
            'billing.country' => ['nullable', 'string'],
            'billing.state' => ['nullable', 'string'],
            'billing.city' => ['nullable', 'string'],
            'billing.address' => ['nullable', 'string'],
            'billing.company' => ['nullable', 'string'],
            'project_name' => ['required', 'string', 'max:255'],
            'project_description' => ['nullable', 'string'],
            'preferred_start_date' => ['nullable', 'date'],
            'reference_links' => ['nullable', 'array'],
        ];
    }
}
