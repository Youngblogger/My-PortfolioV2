<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Receipt;

class ReceiptPolicy
{
    public function view(User $user, Receipt $receipt): bool
    {
        return $user->id === $receipt->user_id || $user->profile?->role === 'admin';
    }
}
