<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Profile;

class ProfilePolicy
{
    public function view(User $user, Profile $profile): bool
    {
        return $user->id === $profile->id || $profile->role === 'admin';
    }

    public function update(User $user, Profile $profile): bool
    {
        return $user->id === $profile->id;
    }

    public function delete(User $user, Profile $profile): bool
    {
        return $user->id === $profile->id || $profile->role === 'admin';
    }
}
