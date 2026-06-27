<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Course;

class CoursePolicy
{
    public function view(?User $user, Course $course): bool
    {
        return $course->is_published;
    }

    public function create(User $user): bool
    {
        return $user->profile?->role === 'admin' || $user->profile?->role === 'instructor';
    }

    public function update(User $user, Course $course): bool
    {
        return $user->profile?->role === 'admin' || $course->instructor_id === $user->id;
    }

    public function delete(User $user, Course $course): bool
    {
        return $user->profile?->role === 'admin';
    }
}
