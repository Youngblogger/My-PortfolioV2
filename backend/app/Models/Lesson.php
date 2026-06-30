<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lesson extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'course_module_id', 'title', 'slug', 'content', 'video_url',
        'duration_minutes', 'sort_order', 'status',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function module()
    {
        return $this->belongsTo(CourseModule::class, 'course_module_id');
    }
}
