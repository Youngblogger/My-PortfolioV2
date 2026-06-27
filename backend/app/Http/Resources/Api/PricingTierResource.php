<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PricingTierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'name' => $this->name,
            'price_ngn' => (float) $this->price_ngn,
            'price_usd' => (float) $this->price_usd,
            'description' => $this->description,
            'features' => $this->features ?? [],
            'is_popular' => $this->is_popular,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
        ];
    }
}
