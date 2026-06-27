<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Course extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'slug', 'stack_id', 'title', 'subtitle', 'description', 'short_description',
        'category', 'icon', 'thumbnail_url', 'cover_url',
        'instructor_id', 'instructor_name', 'instructor_title', 'instructor_avatar',
        'instructor_bio', 'instructor_experience', 'instructor_students',
        'instructor_courses', 'instructor_rating',
        'duration', 'skill_level', 'language', 'last_updated',
        'certificate_included', 'lifetime_access', 'mobile_access',
        'downloadable_resources', 'projects_included', 'community_access',
        'price_ngn', 'price_usd', 'original_price_ngn', 'original_price_usd',
        'discount_percentage', 'currency', 'is_free', 'is_published',
        'average_rating', 'total_reviews', 'students_enrolled',
        'what_you_learn', 'includes', 'requirements', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'price_ngn' => 'decimal:2',
            'price_usd' => 'decimal:2',
            'original_price_ngn' => 'decimal:2',
            'original_price_usd' => 'decimal:2',
            'instructor_rating' => 'float',
            'average_rating' => 'float',
            'is_free' => 'boolean',
            'is_published' => 'boolean',
            'certificate_included' => 'boolean',
            'lifetime_access' => 'boolean',
            'mobile_access' => 'boolean',
            'downloadable_resources' => 'boolean',
            'projects_included' => 'boolean',
            'community_access' => 'boolean',
            'last_updated' => 'date',
            'what_you_learn' => 'array',
            'includes' => 'array',
            'requirements' => 'array',
            'metadata' => 'array',
        ];
    }

    public function instructor()
    {
        return $this->belongsTo(Profile::class, 'instructor_id');
    }

    public function modules()
    {
        return $this->hasMany(CourseModule::class);
    }

    public function pricingTiers()
    {
        return $this->hasMany(PricingTier::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function reviews()
    {
        return $this->hasMany(CourseReview::class);
    }

    public function coupons()
    {
        return $this->hasMany(Coupon::class);
    }
}
