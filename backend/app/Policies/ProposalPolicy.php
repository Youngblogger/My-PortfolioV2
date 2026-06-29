<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Proposal;

class ProposalPolicy
{
    public function view(User $user, Proposal $proposal): bool
    {
        return $user->id === $proposal->user_id || $user->profile?->role === 'admin';
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Proposal $proposal): bool
    {
        return $user->id === $proposal->user_id || $user->profile?->role === 'admin';
    }

    public function delete(User $user, Proposal $proposal): bool
    {
        return $user->profile?->role === 'admin';
    }
}
