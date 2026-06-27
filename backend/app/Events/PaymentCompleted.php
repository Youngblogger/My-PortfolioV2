<?php

namespace App\Events;

use App\Models\Transaction;
use App\Models\Enrollment;
use Illuminate\Foundation\Events\Dispatchable;

class PaymentCompleted
{
    use Dispatchable;

    public function __construct(
        public Transaction $transaction,
        public ?Enrollment $enrollment = null,
    ) {}
}
