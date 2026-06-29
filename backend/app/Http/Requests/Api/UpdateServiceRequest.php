<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->profile?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('services', 'slug')->ignore($this->route('id'))],
            'icon' => ['sometimes', 'string', 'max:50'],
            'short_description' => ['sometimes', 'string', 'max:500'],
            'description' => ['sometimes', 'string'],
            'starting_price_ngn' => ['sometimes', 'numeric', 'min:0'],
            'estimated_delivery' => ['sometimes', 'string', 'max:100'],
            'features' => ['sometimes', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
