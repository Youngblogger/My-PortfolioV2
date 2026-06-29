<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->profile?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'priority' => ['sometimes', 'string', 'in:low,normal,high,urgent'],
            'internal_due_date' => ['sometimes', 'nullable', 'date'],
            'estimated_completion' => ['sometimes', 'nullable', 'date'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
