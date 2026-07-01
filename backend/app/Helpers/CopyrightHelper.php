<?php

namespace App\Helpers;

class CopyrightHelper
{
    public static function render(int $startYear = 2026, string $brand = 'CODEMAFIA'): string
    {
        $currentYear = (int) date('Y');
        $year = $currentYear > $startYear
            ? $startYear . "\u2013" . $currentYear
            : (string) $startYear;

        return "&copy; {$year} {$brand}. All rights reserved.";
    }
}
