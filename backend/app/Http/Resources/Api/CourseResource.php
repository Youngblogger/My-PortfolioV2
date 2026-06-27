<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'stack_id' => $this->stack_id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'category' => $this->category,
            'icon' => $this->icon,
            'thumbnail_url' => $this->thumbnail_url,
            'cover_url' => $this->cover_url,
            'instructor_name' => $this->instructor_name,
            'instructor_title' => $this->instructor_title,
            'instructor_avatar' => $this->instructor_avatar,
            'instructor_bio' => $this->instructor_bio,
            'instructor_experience' => $this->instructor_experience,
            'instructor_students' => $this->instructor_students,
            'instructor_rating' => $this->instructor_rating,
            'duration' => $this->duration,
            'skill_level' => $this->skill_level,
            'language' => $this->language,
            'certificate_included' => $this->certificate_included,
            'lifetime_access' => $this->lifetime_access,
            'price_ngn' => (float) $this->price_ngn,
            'price_usd' => (float) $this->price_usd,
            'original_price_ngn' => $this->original_price_ngn ? (float) $this->original_price_ngn : null,
            'original_price_usd' => $this->original_price_usd ? (float) $this->original_price_usd : null,
            'discount_percentage' => $this->discount_percentage,
            'currency' => $this->currency,
            'is_free' => $this->is_free,
            'is_published' => $this->is_published,
            'average_rating' => (float) $this->average_rating,
            'total_reviews' => $this->total_reviews,
            'students_enrolled' => $this->students_enrolled,
            'what_you_learn' => $this->what_you_learn ?? [],
            'includes' => $this->includes ?? [],
            'requirements' => $this->requirements ?? [],
            'modules' => CourseModuleResource::collection($this->whenLoaded('modules')),
            'pricing_tiers' => PricingTierResource::collection($this->whenLoaded('pricingTiers')),
            'created_at' => $this->created_at,
        ];
    }
}
