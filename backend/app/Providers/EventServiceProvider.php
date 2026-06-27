<?php

namespace App\Providers;

use App\Events\UserRegistered;
use App\Events\PaymentCompleted;
use App\Events\PaymentFailed;
use App\Events\EnrollmentCreated;
use App\Events\InvoiceGenerated;
use App\Events\CouponRedeemed;
use App\Listeners\SendWelcomeEmail;
use App\Listeners\LogPaymentActivity;
use App\Listeners\LogEnrollmentActivity;
use App\Listeners\DispatchEnrollmentEmails;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        UserRegistered::class => [
            SendWelcomeEmail::class,
        ],
        PaymentCompleted::class => [
            [LogPaymentActivity::class, 'handleCompleted'],
        ],
        PaymentFailed::class => [
            [LogPaymentActivity::class, 'handleFailed'],
        ],
        EnrollmentCreated::class => [
            LogEnrollmentActivity::class,
            DispatchEnrollmentEmails::class,
        ],
    ];

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
