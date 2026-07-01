<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\ServiceActivityLog;
use App\Models\ServiceInvoice;
use App\Models\ServiceOrder;
use App\Models\ServicePayment;
use App\Models\ServiceReceipt;
use App\Models\User;
use App\Services\Payments\PaymentService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentWorkflowService
{
    public function __construct(
        private PaymentService $paymentService,
        private EmailService $emailService,
    ) {}

    public function initializeBalancePayment(ServiceOrder $order, string $gateway): array
    {
        $balanceNgn = $order->getBalanceNgn();
        $balanceUsd = $order->getBalanceUsd();
        $metadata = $order->metadata ?? [];
        $projectName = $metadata['project_name'] ?? $order->projectType?->title ?? 'Project';

        if ($balanceNgn <= 0) {
            throw new \RuntimeException('No outstanding balance to pay.');
        }

        $reference = 'BAL-' . strtoupper(uniqid());

        $payment = $this->paymentService->initializePayment(
            $gateway,
            [
                'email' => $order->user?->email ?? 'client@codemafia.ng',
                'amount' => $balanceNgn,
                'currency' => 'NGN',
                'reference' => $reference,
                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'payment_type' => 'balance',
                    'is_balance_payment' => true,
                ],
                'callback_url' => config('app.url') . '/api/v1/service-orders/' . $order->id . '/payment/callback',
            ]
        );

        return [
            'reference' => $payment['reference'],
            'authorization_url' => $payment['authorization_url'],
            'gateway' => $gateway,
            'amount_ngn' => $balanceNgn,
        ];
    }

    public function processBalancePayment(ServiceOrder $order, string $reference, array $verification): void
    {
        DB::beginTransaction();
        try {
            $locked = ServiceOrder::where('id', $order->id)->lockForUpdate()->first();

            if (!$locked || $locked->isFullyPaid()) {
                DB::rollBack();
                Log::info('processBalancePayment: skipped (already fully paid)', ['order_id' => $order->id]);
                return;
            }

            $order = $locked;
            $now = now();
            $amountPaidNgn = $order->getBalanceNgn();
            $amountPaidUsd = $order->getBalanceUsd();

            $totalPaidNgn = $order->getTotalPaidNgn() + $amountPaidNgn;
            $totalPaidUsd = $order->getTotalPaidUsd() + $amountPaidUsd;

            $latestInvoice = $order->invoices()->latest()->first();

            if (!$latestInvoice) {
                DB::rollBack();
                throw new \RuntimeException('No invoice found for this order.');
            }

            $latestInvoice->update([
                'status' => ServiceOrder::INVOICE_STATUS_PAID,
                'amount_paid_ngn' => $totalPaidNgn,
                'amount_paid_usd' => $totalPaidUsd,
                'balance_ngn' => 0,
                'balance_usd' => 0,
            ]);

            $payment = ServicePayment::where('reference', $reference)->first();
            if (!$payment) {
                $payment = ServicePayment::create([
                    'service_order_id' => $order->id,
                    'service_invoice_id' => $latestInvoice->id,
                    'user_id' => $order->user_id,
                    'reference' => $reference,
                    'gateway' => $order->payment_gateway,
                    'amount_ngn' => $amountPaidNgn,
                    'amount_usd' => $amountPaidUsd,
                    'currency' => 'NGN',
                    'status' => 'completed',
                    'payment_type' => 'balance',
                    'gateway_response' => $verification,
                    'paid_at' => $now,
                ]);
            }

            $receiptNumber = 'RCT-SVC-' . strtoupper(substr(uniqid(), -8));
            ServiceReceipt::create([
                'receipt_number' => $receiptNumber,
                'service_order_id' => $order->id,
                'service_invoice_id' => $latestInvoice->id,
                'service_payment_id' => $payment->id,
                'user_id' => $order->user_id,
                'amount_ngn' => $amountPaidNgn,
                'amount_usd' => $amountPaidUsd,
                'currency' => 'NGN',
                'payment_gateway' => $order->payment_gateway,
                'payment_type' => 'balance',
                'status' => 'completed',
                'receipt_data' => [
                    'order_number' => $order->order_number,
                    'project_number' => $order->project_number,
                    'service' => $order->service?->title,
                    'project_type' => $order->projectType?->title,
                    'package' => $order->package?->name,
                    'payment_reference' => $reference,
                    'payment_type' => 'balance',
                ],
            ]);

            $order->update([
                'payment_status' => ServiceOrder::PAYMENT_STATUS_FULLY_PAID,
                'project_status' => ServiceOrder::PROJECT_STATUS_AWAITING_COMPLETION,
            ]);

            $this->logBalancePaymentActivity($order, $reference, $amountPaidNgn, $receiptNumber);
            $this->sendBalancePaymentNotifications($order, $amountPaidNgn);

            DB::commit();

            Log::info('Balance payment processed successfully', [
                'order_id' => $order->id,
                'reference' => $reference,
                'amount_ngn' => $amountPaidNgn,
                'receipt_number' => $receiptNumber,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Balance payment processing failed', [
                'order_id' => $order->id,
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function logBalancePaymentActivity(ServiceOrder $order, string $reference, float $amountNgn, string $receiptNumber): void
    {
        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $order->user_id,
            'action' => 'balance_payment_verified',
            'description' => 'Balance payment of ' . number_format($amountNgn, 2) . ' NGN received. Project fully paid.',
            'metadata' => ['reference' => $reference, 'amount_ngn' => $amountNgn],
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $order->user_id,
            'action' => 'invoice_updated',
            'description' => 'Invoice fully paid. Balance cleared.',
            'metadata' => ['invoice_status' => 'paid'],
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $order->user_id,
            'action' => 'receipt_generated',
            'description' => 'Receipt ' . $receiptNumber . ' generated for balance payment.',
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $order->user_id,
            'action' => 'payment_status_changed',
            'description' => 'Payment status changed to Fully Paid. Project awaiting completion.',
            'metadata' => [
                'payment_status' => ServiceOrder::PAYMENT_STATUS_FULLY_PAID,
                'project_status' => ServiceOrder::PROJECT_STATUS_AWAITING_COMPLETION,
            ],
        ]);
    }

    private function sendBalancePaymentNotifications(ServiceOrder $order, float $amountNgn): void
    {
        $metadata = $order->metadata ?? [];
        $projectName = $metadata['project_name'] ?? $order->projectType?->title ?? 'Project';

        Notification::create([
            'user_id' => $order->user_id,
            'service_order_id' => $order->id,
            'type' => 'balance_payment_success',
            'title' => 'Balance Payment Received!',
            'body' => 'Your payment of ' . number_format($amountNgn, 2) . ' NGN has been received. Your project is fully paid and our team is completing the final work.',
            'action_url' => '/hire/project/' . $order->id,
            'action_text' => 'View Project Workspace',
            'channel' => 'in_app',
        ]);

        Notification::create([
            'user_id' => $order->user_id,
            'service_order_id' => $order->id,
            'type' => 'project_fully_paid',
            'title' => 'Project Fully Paid',
            'body' => 'Your project "' . $projectName . '" is fully paid. Downloads will become available once the project is completed.',
            'action_url' => '/hire/project/' . $order->id,
            'action_text' => 'View Project',
            'channel' => 'in_app',
        ]);

        $admins = User::whereHas('profile', fn ($q) => $q->where('role', 'admin'))->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'service_order_id' => $order->id,
                'type' => 'balance_received',
                'title' => 'Balance Payment: ' . $projectName,
                'body' => 'Client has completed payment. Project is fully paid and awaiting completion.',
                'action_url' => '/admin/orders/' . $order->id,
                'action_text' => 'View Order',
                'channel' => 'in_app',
            ]);
        }
    }
}
