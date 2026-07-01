<?php

if (!function_exists('formatCurrency')) {
    function formatCurrency(float $amount, string $currency = 'NGN'): string
    {
        $symbols = [
            'NGN' => '₦',
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
        ];
        $symbol = $symbols[$currency] ?? $currency . ' ';
        return $symbol . number_format($amount, 2);
    }
}

if (!function_exists('generateReference')) {
    function generateReference(string $prefix = 'CMA'): string
    {
        $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
        return $prefix . '-' . date('y') . '-' . $random;
    }
}

if (!function_exists('generateEnrollmentNumber')) {
    function generateEnrollmentNumber(): string
    {
        $prefix = 'CMA-';
        $yearPart = date('y');
        $randomPart = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
        return $prefix . $yearPart . '-' . $randomPart;
    }
}

if (!function_exists('generateInvoiceNumber')) {
    function generateInvoiceNumber(): string
    {
        $prefix = 'INV-CMA-';
        $yearPart = date('Y');
        $seq = \Illuminate\Support\Facades\DB::table('number_sequences')
            ->where('type', 'invoice')
            ->lockForUpdate()
            ->value('current_number') ?? 0;
        $seq++;
        \Illuminate\Support\Facades\DB::table('number_sequences')
            ->updateOrInsert(['type' => 'invoice'], ['current_number' => $seq]);
        return $prefix . $yearPart . '-' . str_pad($seq, 5, '0', STR_PAD_LEFT);
    }
}

if (!function_exists('generateReceiptNumber')) {
    function generateReceiptNumber(): string
    {
        $prefix = 'RCT-CMA-';
        $yearPart = date('Y');
        $seq = \Illuminate\Support\Facades\DB::table('number_sequences')
            ->where('type', 'receipt')
            ->lockForUpdate()
            ->value('current_number') ?? 0;
        $seq++;
        \Illuminate\Support\Facades\DB::table('number_sequences')
            ->updateOrInsert(['type' => 'receipt'], ['current_number' => $seq]);
        return $prefix . $yearPart . '-' . str_pad($seq, 5, '0', STR_PAD_LEFT);
    }
}

if (!function_exists('calculateTax')) {
    function calculateTax(float $amount, ?string $country): float
    {
        $rates = [
            'NG' => 0.075,
            'US' => 0.0,
            'GB' => 0.20,
        ];
        $rate = $rates[$country ?? 'default'] ?? 0.0;
        return round($amount * $rate, 2);
    }
}

if (!function_exists('calculateDiscount')) {
    function calculateDiscount(float $price, string $discountType, float $discountValue): float
    {
        if ($discountType === 'percentage') {
            return round($price * ($discountValue / 100), 2);
        }
        return min($discountValue, $price);
    }
}

if (!function_exists('escapeHtml')) {
    function escapeHtml(?string $value): string
    {
        if ($value === null) return '';
        return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}

if (!function_exists('sanitizeUrl')) {
    function sanitizeUrl(?string $url): string
    {
        if ($url === null) return '#';
        $allowedSchemes = ['https', 'http', 'mailto', 'tel'];
        $parsed = parse_url($url);
        $scheme = $parsed['scheme'] ?? '';
        if (!in_array($scheme, $allowedSchemes, true)) {
            return '#';
        }
        return $url;
    }
}

if (!function_exists('copyright')) {
    function copyright(int $startYear = 2026, string $brand = 'CODEMAFIA'): string
    {
        $currentYear = (int) date('Y');
        $year = $currentYear > $startYear
            ? $startYear . "\u2013" . $currentYear
            : (string) $startYear;

        return "&copy; {$year} {$brand}. All rights reserved.";
    }
}
