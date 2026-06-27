<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Enrollment;

class EnrollmentPolicy
{
    public function view(User $user, Enrollment $enrollment): bool
    {
        return $user->id === $enrollment->user_id || $user->profile?->role === 'admin';
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Enrollment $enrollment): bool
    {
        return $user->id === $enrollment->user_id || $user->profile?->role === 'admin';
    }
}
