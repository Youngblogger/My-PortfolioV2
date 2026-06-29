<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CreateDiscoveryCallRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'meeting_type' => ['required', 'in:google_meet,zoom,phone'],
            'preferred_date' => ['required', 'date', 'after:today'],
            'preferred_time' => ['required', 'date_format:H:i'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'project_summary' => ['nullable', 'string', 'max:5000'],
            'service_order_id' => ['nullable', 'exists:service_orders,id'],
        ];
    }
}
