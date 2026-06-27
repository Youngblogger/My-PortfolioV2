<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnrollmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'course_id' => $this->course_id,
            'tier_id' => $this->tier_id,
            'enrollment_number' => $this->enrollment_number,
            'status' => $this->status,
            'progress' => (float) $this->progress,
            'certificate_url' => $this->certificate_url,
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'course' => new CourseResource($this->whenLoaded('course')),
            'created_at' => $this->created_at,
        ];
    }
}
