<?php

namespace App\Policies;

use App\Models\User;
use App\Models\CourseReview;

class CourseReviewPolicy
{
    public function view(?User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CourseReview $review): bool
    {
        return $user->id === $review->user_id || $user->profile?->role === 'admin';
    }

    public function delete(User $user, CourseReview $review): bool
    {
        return $user->id === $review->user_id || $user->profile?->role === 'admin';
    }
}
