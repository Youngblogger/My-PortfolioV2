<?php

namespace App\Listeners;

use App\Events\PaymentCompleted;
use App\Events\PaymentFailed;
use App\Services\AuditService;
use Illuminate\Support\Facades\Log;

class LogPaymentActivity
{
    public function __construct(private AuditService $audit) {}

    public function handleCompleted(PaymentCompleted $event): void
    {
        $this->audit->log(
            'payment.completed',
            $event->transaction->user_id,
            'transaction',
            $event->transaction->id,
            ['reference' => $event->transaction->transaction_reference, 'amount' => $event->transaction->amount],
        );

        Log::info('Payment completed', [
            'reference' => $event->transaction->transaction_reference,
            'amount' => $event->transaction->amount,
            'user_id' => $event->transaction->user_id,
        ]);
    }

    public function handleFailed(PaymentFailed $event): void
    {
        $this->audit->log(
            'payment.failed',
            $event->transaction->user_id,
            'transaction',
            $event->transaction->id,
            ['reference' => $event->transaction->transaction_reference, 'reason' => $event->reason],
        );

        Log::warning('Payment failed', [
            'reference' => $event->transaction->transaction_reference,
            'reason' => $event->reason,
        ]);
    }
}
