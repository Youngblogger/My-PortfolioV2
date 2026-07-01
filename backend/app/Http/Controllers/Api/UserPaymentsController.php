<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\ServicePayment;
use Illuminate\Http\Request;

class UserPaymentsController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $orders = ServiceOrder::with(['service', 'projectType', 'payments', 'invoices'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        $allPayments = [];
        foreach ($orders as $order) {
            $metadata = $order->metadata ?? [];
            foreach ($order->payments as $payment) {
                $allPayments[] = [
                    'id' => $payment->id,
                    'reference' => $payment->reference,
                    'gateway' => $payment->gateway,
                    'amount_ngn' => (float) $payment->amount_ngn,
                    'amount_usd' => (float) ($payment->amount_usd ?? 0),
                    'currency' => $payment->currency ?? 'NGN',
                    'status' => $payment->status,
                    'payment_type' => $payment->payment_type,
                    'paid_at' => $payment->paid_at?->toIso8601String(),
                    'created_at' => $payment->created_at->toIso8601String(),
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'project_name' => $metadata['project_name'] ?? $order->projectType?->title ?? 'Project',
                    'service' => $order->service?->title,
                ];
            }
        }

        usort($allPayments, fn ($a, $b) => strcmp($b['created_at'], $a['created_at']));

        $totals = [
            'total_spent_ngn' => array_sum(array_column($allPayments, 'amount_ngn')),
            'total_paid' => count(array_filter($allPayments, fn ($p) => $p['status'] === 'paid')),
            'total_pending' => count(array_filter($allPayments, fn ($p) => $p['status'] === 'pending')),
            'total_failed' => count(array_filter($allPayments, fn ($p) => $p['status'] === 'failed')),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'payments' => $allPayments,
                'totals' => $totals,
            ],
        ]);
    }
}
