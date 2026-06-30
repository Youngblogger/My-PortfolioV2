<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Enrollment extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'user_id', 'course_id', 'tier_id', 'enrollment_number', 'status',
        'progress', 'certificate_url', 'started_at', 'completed_at', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'progress' => 'decimal:2',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function tier()
    {
        return $this->belongsTo(PricingTier::class);
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function receipt()
    {
        return $this->hasOne(Receipt::class);
    }
}
