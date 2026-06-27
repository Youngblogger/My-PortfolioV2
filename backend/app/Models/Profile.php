<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Profile extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'email',
        'full_name',
        'avatar_url',
        'phone',
        'country',
        'state',
        'city',
        'address',
        'company',
        'tax_id',
        'role',
        'bio',
        'title',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id', 'id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'user_id', 'id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'user_id', 'id');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'user_id', 'id');
    }

    public function receipts()
    {
        return $this->hasMany(Receipt::class, 'user_id', 'id');
    }

    public function reviews()
    {
        return $this->hasMany(CourseReview::class, 'user_id', 'id');
    }

    public function courses()
    {
        return $this->hasMany(Course::class, 'instructor_id', 'id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isInstructor(): bool
    {
        return $this->role === 'instructor';
    }
}
