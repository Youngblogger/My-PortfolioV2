<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ChangeProjectStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->profile?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:draft,active,on_hold,blocked,completed,cancelled'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }
}
