<?php

namespace App\Events;

use App\Models\Enrollment;
use Illuminate\Foundation\Events\Dispatchable;

class EnrollmentCreated
{
    use Dispatchable;

    public function __construct(public Enrollment $enrollment) {}
}
