<?php

namespace App\Services;

use App\Models\Milestone;
use App\Models\Notification;
use App\Models\ServiceActivityLog;
use App\Models\ServiceInvoice;
use App\Models\ServiceOrder;
use App\Models\ServicePayment;
use App\Models\ServiceReceipt;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ServiceOrderService
{
    public function processVerifiedPayment(ServiceOrder $order, string $reference, array $verification): void
    {
        DB::beginTransaction();
        try {
            $locked = ServiceOrder::where('id', $order->id)->lockForUpdate()->first();

            if (!$locked || $locked->isFullyPaid()) {
                DB::rollBack();
                Log::info('processVerifiedPayment: skipped (already paid)', ['order_id' => $order->id]);
                return;
            }

            $order = $locked;
            $now = now();
            $metadata = $order->metadata ?? [];
            $paymentType = $metadata['payment_type'] ?? 'full';
            $amountPaidNgn = $paymentType === 'deposit' ? $order->total_ngn / 2 : $order->total_ngn;
            $amountPaidUsd = $paymentType === 'deposit' ? $order->total_usd / 2 : $order->total_usd;
            $balanceNgn = $order->total_ngn - $amountPaidNgn;
            $balanceUsd = $order->total_usd - $amountPaidUsd;
            $projectName = $metadata['project_name'] ?? $order->projectType->title;

            $projectNumber = 'PRJ-' . strtoupper(substr(uniqid(), -8));

            $order->update([
                'payment_status' => $balanceNgn > 0 ? ServiceOrder::PAYMENT_STATUS_DEPOSIT_PAID : ServiceOrder::PAYMENT_STATUS_FULLY_PAID,
                'status' => 'active',
                'project_number' => $projectNumber,
                'project_status' => ServiceOrder::PROJECT_STATUS_PENDING,
                'project_created_at' => $now,
            ]);

            $invoiceNumber = 'INV-SVC-' . strtoupper(substr(uniqid(), -8));
            $invoice = ServiceInvoice::create([
                'invoice_number' => $invoiceNumber,
                'service_order_id' => $order->id,
                'user_id' => $order->user_id,
                'status' => $balanceNgn > 0 ? ServiceOrder::INVOICE_STATUS_PARTIALLY_PAID : ServiceOrder::INVOICE_STATUS_PAID,
                'subtotal_ngn' => $order->total_ngn,
                'subtotal_usd' => $order->total_usd,
                'total_ngn' => $order->total_ngn,
                'total_usd' => $order->total_usd,
                'amount_paid_ngn' => $amountPaidNgn,
                'amount_paid_usd' => $amountPaidUsd,
                'balance_ngn' => $balanceNgn,
                'balance_usd' => $balanceUsd,
                'payment_type' => $paymentType,
                'paid_at' => $now,
            ]);

            $payment = ServicePayment::where('reference', $reference)->first();
            if (!$payment) {
                $payment = ServicePayment::create([
                    'service_order_id' => $order->id,
                    'service_invoice_id' => $invoice->id,
                    'user_id' => $order->user_id,
                    'reference' => $reference,
                    'gateway' => $order->payment_gateway,
                    'amount_ngn' => $amountPaidNgn,
                    'amount_usd' => $amountPaidUsd,
                    'currency' => 'NGN',
                    'status' => 'completed',
                    'payment_type' => $paymentType,
                    'gateway_response' => $verification,
                    'paid_at' => $now,
                ]);
            } else {
                Log::info('processVerifiedPayment: payment already exists', [
                    'order_id' => $order->id,
                    'reference' => $reference,
                    'payment_id' => $payment->id,
                ]);
            }

            $receiptNumber = 'RCT-SVC-' . strtoupper(substr(uniqid(), -8));
            ServiceReceipt::create([
                'receipt_number' => $receiptNumber,
                'service_order_id' => $order->id,
                'service_invoice_id' => $invoice->id,
                'service_payment_id' => $payment->id,
                'user_id' => $order->user_id,
                'amount_ngn' => $amountPaidNgn,
                'amount_usd' => $amountPaidUsd,
                'currency' => 'NGN',
                'payment_gateway' => $order->payment_gateway,
                'payment_type' => $paymentType,
                'status' => 'completed',
                'receipt_data' => [
                    'order_number' => $order->order_number,
                    'project_number' => $projectNumber,
                    'service' => $order->service?->title,
                    'project_type' => $order->projectType?->title,
                    'package' => $order->package?->name,
                    'project_name' => $projectName,
                    'payment_reference' => $reference,
                ],
            ]);

            $this->createProjectTimeline($order, $now, $balanceNgn);
            $this->logPaymentActivity($order, $reference, $amountPaidNgn, $invoiceNumber, $receiptNumber, $projectNumber, $projectName);
            $this->sendPaymentNotifications($order, $projectName, $projectNumber, $amountPaidNgn);

            DB::commit();

            Log::info('Payment processed successfully', [
                'order_id' => $order->id,
                'reference' => $reference,
                'project_number' => $projectNumber,
                'invoice_number' => $invoiceNumber,
                'receipt_number' => $receiptNumber,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment processing failed', [
                'order_id' => $order->id,
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function logPaymentActivity(ServiceOrder $order, string $reference, float $amountPaidNgn, string $invoiceNumber, string $receiptNumber, string $projectNumber, string $projectName): void
    {
        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $order->user_id,
            'action' => 'payment_verified',
            'description' => 'Payment of ' . number_format($amountPaidNgn, 2) . ' NGN verified successfully.',
            'metadata' => ['gateway' => $order->payment_gateway, 'reference' => $reference],
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $order->user_id,
            'action' => 'invoice_generated',
            'description' => 'Invoice ' . $invoiceNumber . ' generated.',
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $order->user_id,
            'action' => 'receipt_generated',
            'description' => 'Receipt ' . $receiptNumber . ' generated.',
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $order->user_id,
            'action' => 'project_created',
            'description' => 'Project ' . $projectNumber . ' created and workspace provisioned.',
            'metadata' => ['project_number' => $projectNumber],
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $order->user_id,
            'action' => 'timeline_initialized',
            'description' => 'Project timeline with 11 milestones initialized.',
        ]);
    }

    private function sendPaymentNotifications(ServiceOrder $order, string $projectName, string $projectNumber, float $amountPaidNgn): void
    {
        Notification::create([
            'user_id' => $order->user_id,
            'service_order_id' => $order->id,
            'type' => 'payment_received',
            'title' => 'Payment Confirmed!',
            'body' => 'Your payment of ' . number_format($amountPaidNgn, 2) . ' NGN has been received. Project ' . $projectNumber . ' is now being prepared.',
            'action_url' => '/hire/project/' . $order->id,
            'action_text' => 'View Project Workspace',
            'channel' => 'in_app',
        ]);

        Notification::create([
            'user_id' => $order->user_id,
            'service_order_id' => $order->id,
            'type' => 'project_created',
            'title' => 'Project Workspace Ready',
            'body' => 'Your project workspace for ' . $projectName . ' is ready. Track progress, milestones, and team activity.',
            'action_url' => '/hire/project/' . $order->id,
            'action_text' => 'Open Workspace',
            'channel' => 'in_app',
        ]);

        $admins = User::whereHas('profile', fn ($q) => $q->where('role', 'admin'))->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'service_order_id' => $order->id,
                'type' => 'new_project',
                'title' => 'New Project: ' . $projectName,
                'body' => $projectName . ' — ' . number_format($amountPaidNgn, 2) . ' NGN paid. Review and assign team.',
                'action_url' => '/admin/orders/' . $order->id,
                'action_text' => 'View Order',
                'channel' => 'in_app',
            ]);
        }
    }

    private function createProjectTimeline(ServiceOrder $order, $now, float $balanceNgn): void
    {
        $milestones = [
            [
                'title' => 'Payment Confirmed',
                'milestone_type' => 'payment',
                'description' => 'Payment has been verified and the project is being initiated.',
                'sort_order' => 1,
                'due_date' => $now,
                'status' => 'completed',
                'completed_at' => $now,
                'deliverables' => ['Payment verification', 'Invoice generated', 'Receipt generated'],
            ],
            [
                'title' => 'Project Created',
                'milestone_type' => 'setup',
                'description' => 'Project record and workspace have been provisioned.',
                'sort_order' => 2,
                'due_date' => $now,
                'status' => 'completed',
                'completed_at' => $now,
                'deliverables' => ['Project number assigned', 'Workspace provisioned', 'Initial timeline created'],
            ],
            [
                'title' => 'Requirements Review',
                'milestone_type' => 'planning',
                'description' => 'Our team reviews your project requirements and submitted files.',
                'sort_order' => 3,
                'due_date' => $now->copy()->addDays(1),
                'status' => 'pending',
                'deliverables' => ['Requirements assessment', 'Clarity questions (if needed)', 'Feasibility check'],
            ],
            [
                'title' => 'Team Assignment',
                'milestone_type' => 'team',
                'description' => 'Project manager and team members are assigned to your project.',
                'sort_order' => 4,
                'due_date' => $now->copy()->addDays(2),
                'status' => 'pending',
                'deliverables' => ['Project manager assigned', 'Developer(s) assigned', 'Designer assigned (if applicable)'],
            ],
            [
                'title' => 'Kickoff',
                'milestone_type' => 'kickoff',
                'description' => 'Project kickoff meeting and final scope alignment.',
                'sort_order' => 5,
            ],
            [
                'title' => 'Design & Prototyping',
                'milestone_type' => 'design',
                'description' => 'UI/UX design and prototype creation.',
                'sort_order' => 6,
            ],
            [
                'title' => 'Development Phase 1',
                'milestone_type' => 'development',
                'description' => 'Core development and feature implementation.',
                'sort_order' => 7,
            ],
            [
                'title' => 'Development Phase 2',
                'milestone_type' => 'development',
                'description' => 'Additional features and integrations.',
                'sort_order' => 8,
            ],
            [
                'title' => 'Testing & QA',
                'milestone_type' => 'testing',
                'description' => 'Comprehensive testing across all platforms.',
                'sort_order' => 9,
            ],
            [
                'title' => 'Client Review',
                'milestone_type' => 'review',
                'description' => 'Review deliverables and provide feedback.',
                'sort_order' => 10,
            ],
            [
                'title' => 'Deployment & Handover',
                'milestone_type' => 'deployment',
                'description' => 'Final deployment, documentation, and project handover.',
                'sort_order' => 11,
            ],
        ];

        foreach ($milestones as $milestone) {
            $milestone['service_order_id'] = $order->id;
            if (!isset($milestone['status'])) {
                $milestone['status'] = 'pending';
            }
            if (!isset($milestone['deliverables'])) {
                $milestone['deliverables'] = [];
            }
            Milestone::create($milestone);
        }
    }
}
