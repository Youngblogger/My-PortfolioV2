<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class MilestoneActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->profile?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
