<?php

namespace App\Policies;

use App\Models\User;
use App\Models\DiscoveryCall;

class DiscoveryCallPolicy
{
    public function view(User $user, DiscoveryCall $discoveryCall): bool
    {
        return $user->id === $discoveryCall->user_id || $user->profile?->role === 'admin';
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, DiscoveryCall $discoveryCall): bool
    {
        return $user->profile?->role === 'admin';
    }
}
