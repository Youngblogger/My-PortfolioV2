<?php

namespace App\Listeners;

use App\Events\EnrollmentCreated;
use App\Models\Course;
use App\Services\EmailService;

class DispatchEnrollmentEmails
{
    public function __construct(private EmailService $email) {}

    public function handle(EnrollmentCreated $event): void
    {
        $enrollment = $event->enrollment;
        $course = Course::find($enrollment->course_id);

        if (!$course) return;

        $billing = $enrollment->metadata['billing'] ?? [];

        $this->email->sendEnrollmentConfirmation($enrollment, $course, $billing);
    }
}
