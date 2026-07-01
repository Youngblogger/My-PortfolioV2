<?php

namespace App\Helpers;

class PdfHelper
{
    public static function formatCurrency(float $amount, string $currency = 'NGN'): string
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

    public static function statusBadge(string $status): string
    {
        $map = [
            'paid' => ['label' => 'PAID', 'class' => 'status-paid'],
            'completed' => ['label' => 'PAID', 'class' => 'status-paid'],
            'partially_paid' => ['label' => 'PARTIALLY PAID', 'class' => 'status-partial'],
            'partial' => ['label' => 'PARTIALLY PAID', 'class' => 'status-partial'],
            'deposit' => ['label' => 'DEPOSIT', 'class' => 'status-partial'],
            'unpaid' => ['label' => 'UNPAID', 'class' => 'status-unpaid'],
            'pending' => ['label' => 'UNPAID', 'class' => 'status-unpaid'],
            'overdue' => ['label' => 'OVERDUE', 'class' => 'status-overdue'],
            'cancelled' => ['label' => 'CANCELLED', 'class' => 'status-cancelled'],
            'refunded' => ['label' => 'REFUNDED', 'class' => 'status-cancelled'],
        ];
        $s = $map[strtolower($status)] ?? ['label' => strtoupper($status), 'class' => 'status-unpaid'];
        return '<span class="badge ' . $s['class'] . '">' . $s['label'] . '</span>';
    }

    public static function watermarkText(string $status): string
    {
        $map = [
            'paid' => 'PAID',
            'completed' => 'PAID',
            'partially_paid' => 'PARTIALLY PAID',
            'partial' => 'PARTIALLY PAID',
            'deposit' => 'DEPOSIT PAID',
            'unpaid' => 'UNPAID',
            'pending' => 'UNPAID',
            'overdue' => 'OVERDUE',
        ];
        return $map[strtolower($status)] ?? '';
    }

    public static function invoiceStatus(string $status): string
    {
        $map = [
            'paid' => 'Paid',
            'completed' => 'Paid',
            'partially_paid' => 'Partially Paid',
            'partial' => 'Partially Paid',
            'deposit' => 'Deposit',
            'unpaid' => 'Unpaid',
            'pending' => 'Unpaid',
            'overdue' => 'Overdue',
            'cancelled' => 'Cancelled',
            'refunded' => 'Refunded',
        ];
        return $map[strtolower($status)] ?? ucfirst($status);
    }
}
