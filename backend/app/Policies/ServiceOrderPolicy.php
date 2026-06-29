<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ServiceOrder;

class ServiceOrderPolicy
{
    public function view(User $user, ServiceOrder $serviceOrder): bool
    {
        return $user->id === $serviceOrder->user_id || $user->profile?->role === 'admin';
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ServiceOrder $serviceOrder): bool
    {
        return $user->profile?->role === 'admin';
    }
}
