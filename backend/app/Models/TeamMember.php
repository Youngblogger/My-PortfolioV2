<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TeamMember extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'user_id', 'title', 'role_slug', 'bio', 'avatar_url',
        'skills', 'is_available', 'hourly_rate_ngn', 'hourly_rate_usd',
    ];

    protected function casts(): array
    {
        return [
            'skills' => 'array',
            'is_available' => 'boolean',
            'hourly_rate_ngn' => 'decimal:2',
            'hourly_rate_usd' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignments()
    {
        return $this->hasMany(TeamAssignment::class);
    }
}
