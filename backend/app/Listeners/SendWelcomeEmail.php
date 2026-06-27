<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use Illuminate\Support\Facades\Log;

class SendWelcomeEmail
{
    public function handle(UserRegistered $event): void
    {
        Log::info('Welcome email would be sent', ['user_id' => $event->user->id]);
    }
}
