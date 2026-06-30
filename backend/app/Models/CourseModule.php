<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CourseModule extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'course_id', 'title', 'description', 'sort_order', 'lessons',
    ];

    protected function casts(): array
    {
        return [
            'lessons' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class, 'course_module_id');
    }
}
