<?php

namespace App\Events;

use App\Models\Coupon;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;

class CouponRedeemed
{
    use Dispatchable;

    public function __construct(
        public Coupon $coupon,
        public User $user,
    ) {}
}
