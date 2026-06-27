<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Coupon extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'code', 'description', 'discount_type', 'discount_value',
        'min_purchase', 'max_uses', 'current_uses', 'expires_at',
        'is_active', 'course_id', 'user_id', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'min_purchase' => 'decimal:2',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function creator()
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }
}
