<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Coupon;

class CouponPolicy
{
    public function view(User $user): bool
    {
        return $user->profile?->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->profile?->role === 'admin';
    }

    public function update(User $user): bool
    {
        return $user->profile?->role === 'admin';
    }

    public function delete(User $user): bool
    {
        return $user->profile?->role === 'admin';
    }
}
