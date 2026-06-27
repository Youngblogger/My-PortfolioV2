<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'full_name' => $this->profile?->full_name,
            'avatar_url' => $this->profile?->avatar_url,
            'role' => $this->profile?->role ?? 'student',
        ];
    }
}
