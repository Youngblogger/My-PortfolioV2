<?php

namespace App\Listeners;

use App\Events\EnrollmentCreated;
use App\Services\AuditService;

class LogEnrollmentActivity
{
    public function __construct(private AuditService $audit) {}

    public function handle(EnrollmentCreated $event): void
    {
        $this->audit->log(
            'enrollment.created',
            $event->enrollment->user_id,
            'enrollment',
            $event->enrollment->id,
            ['course_id' => $event->enrollment->course_id, 'number' => $event->enrollment->enrollment_number],
        );
    }
}
