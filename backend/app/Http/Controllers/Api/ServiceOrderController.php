<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreateOrderRequest;
use App\Models\ServiceOrder;
use App\Models\OrderAddOn;
use App\Models\ServiceInvoice;
use App\Models\ServicePayment;
use App\Models\ServiceReceipt;
use App\Models\ServiceActivityLog;
use App\Models\Milestone;
use App\Models\AddOn;
use App\Models\Package;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Services\Payments\PaymentService;

class ServiceOrderController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
    ) {}

    public function createQuote(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_id' => ['required', 'string', 'exists:services,id'],
            'project_type_id' => ['required', 'string', 'exists:project_types,id'],
            'package_id' => ['required', 'string', 'exists:packages,id'],
            'add_on_ids' => ['nullable', 'array'],
            'add_on_ids.*' => ['string', 'exists:add_ons,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        $package = Package::findOrFail($request->package_id);
        $addOns = AddOn::whereIn('id', $request->add_on_ids ?? [])->get();

        $packagePriceNgn = (float) $package->price_ngn;
        $packagePriceUsd = (float) $package->price_usd;
        $addOnsTotalNgn = $addOns->sum(fn ($a) => (float) $a->price_ngn);
        $addOnsTotalUsd = $addOns->sum(fn ($a) => (float) $a->price_usd);
        $totalNgn = $packagePriceNgn + $addOnsTotalNgn;
        $totalUsd = $packagePriceUsd + $addOnsTotalUsd;

        return response()->json([
            'success' => true,
            'data' => [
                'package' => [
                    'id' => $package->id,
                    'name' => $package->name,
                    'price_ngn' => $packagePriceNgn,
                    'price_usd' => $packagePriceUsd,
                ],
                'add_ons' => $addOns->map(fn ($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'price_ngn' => (float) $a->price_ngn,
                    'price_usd' => (float) $a->price_usd,
                ]),
                'package_price_ngn' => $packagePriceNgn,
                'package_price_usd' => $packagePriceUsd,
                'add_ons_total_ngn' => $addOnsTotalNgn,
                'add_ons_total_usd' => $addOnsTotalUsd,
                'total_ngn' => $totalNgn,
                'total_usd' => $totalUsd,
            ],
        ]);
    }

    public function placeOrder(CreateOrderRequest $request)
    {
        try {
            DB::beginTransaction();

            $package = Package::findOrFail($request->package_id);
            $addOns = AddOn::whereIn('id', $request->add_on_ids ?? [])->get();

            $packagePriceNgn = (float) $package->price_ngn;
            $packagePriceUsd = (float) $package->price_usd;
            $addOnsTotalNgn = $addOns->sum(fn ($a) => (float) $a->price_ngn);
            $addOnsTotalUsd = $addOns->sum(fn ($a) => (float) $a->price_usd);
            $totalNgn = $packagePriceNgn + $addOnsTotalNgn;
            $totalUsd = $packagePriceUsd + $addOnsTotalUsd;

            Log::info('Payment initialization started', [
                'service_id' => $request->service_id,
                'package_id' => $request->package_id,
                'add_on_count' => count($addOns),
                'gateway' => $request->payment_gateway,
                'amount_ngn' => $totalNgn,
            ]);

            $depositPercentage = $request->payment_type === 'deposit' ? 50 : 100;
            $amountDueNgn = ($totalNgn * $depositPercentage) / 100;
            $amountDueUsd = ($totalUsd * $depositPercentage) / 100;

            $orderNumber = 'SVC-' . strtoupper(substr(uniqid(), -8));

            $order = ServiceOrder::create([
                'order_number' => $orderNumber,
                'user_id' => $request->user()->id,
                'service_id' => $request->service_id,
                'project_type_id' => $request->project_type_id,
                'package_id' => $request->package_id,
                'status' => 'pending_payment',
                'package_price_ngn' => $packagePriceNgn,
                'package_price_usd' => $packagePriceUsd,
                'add_ons_total_ngn' => $addOnsTotalNgn,
                'add_ons_total_usd' => $addOnsTotalUsd,
                'total_ngn' => $totalNgn,
                'total_usd' => $totalUsd,
                'currency' => 'NGN',
                'payment_status' => 'pending',
                'payment_gateway' => $request->payment_gateway,
                'billing_details' => $request->billing,
                'metadata' => [
                    'project_name' => $request->project_name,
                    'project_description' => $request->project_description,
                    'preferred_start_date' => $request->preferred_start_date,
                    'reference_links' => $request->reference_links,
                    'payment_type' => $request->payment_type,
                ],
            ]);

            foreach ($addOns as $addOn) {
                OrderAddOn::create([
                    'service_order_id' => $order->id,
                    'add_on_id' => $addOn->id,
                    'name' => $addOn->name,
                    'price_ngn' => (float) $addOn->price_ngn,
                    'price_usd' => (float) $addOn->price_usd,
                ]);
            }

            $reference = 'SVC-' . strtoupper(uniqid());

            $payment = $this->paymentService->initializePayment(
                $request->payment_gateway,
                [
                    'email' => $request->billing['email'] ?? $request->user()->email,
                    'amount' => $amountDueNgn,
                    'currency' => 'NGN',
                    'reference' => $reference,
                    'metadata' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'payment_type' => $request->payment_type,
                        'customer_name' => $request->billing['full_name'] ?? $request->user()->name,
                    ],
                    'callback_url' => config('app.url') . '/api/v1/service-orders/' . $order->id . '/payment/callback',
                ]
            );

            $order->update([
                'transaction_reference' => $payment['reference'],
                'payment_status' => 'processing',
            ]);

            Log::info('Payment initialized successfully', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'reference' => $payment['reference'],
                'authorization_url' => $payment['authorization_url'],
                'gateway' => $request->payment_gateway,
            ]);

            ServiceActivityLog::create([
                'service_order_id' => $order->id,
                'user_id' => $request->user()->id,
                'action' => 'order_placed',
                'description' => 'Order placed with ' . $request->payment_gateway . ' payment.',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'reference' => $payment['reference'],
                    'authorization_url' => $payment['authorization_url'],
                    'gateway' => $request->payment_gateway,
                    'amount_ngn' => $amountDueNgn,
                    'amount_usd' => $amountDueUsd,
                    'payment_type' => $request->payment_type,
                ],
            ]);
        } catch (\RuntimeException $e) {
            DB::rollBack();
            Log::error('Payment initialization failed', [
                'error' => $e->getMessage(),
                'service_id' => $request->service_id,
                'gateway' => $request->payment_gateway,
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function verifyPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reference' => ['required', 'string'],
            'order_id' => ['required', 'string', 'exists:service_orders,id'],
        ]);

        if ($validator->fails()) {
            Log::warning('Payment verification validation failed', ['errors' => $validator->errors()->toArray()]);
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        Log::info('Payment verification request', [
            'order_id' => $request->order_id,
            'reference' => $request->reference,
        ]);

        try {
            $order = ServiceOrder::with(['service', 'projectType', 'package', 'addOns', 'user.profile'])
                ->findOrFail($request->order_id);

            if ($order->user_id !== $request->user()->id) {
                Log::warning('Payment verification unauthorized', [
                    'order_id' => $request->order_id,
                    'user_id' => $request->user()->id,
                ]);
                return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
            }

            if ($order->payment_status === 'paid' || $order->payment_status === 'completed') {
                Log::info('Payment verification - duplicate request', ['order_id' => $request->order_id]);
                $existingInvoice = $order->invoices()->latest()->first();
                $existingReceipt = $order->receipts()->latest()->first();
                return response()->json([
                    'success' => true,
                    'data' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'invoice_number' => $existingInvoice?->invoice_number,
                        'receipt_number' => $existingReceipt?->receipt_number,
                        'status' => $order->status,
                        'project_status' => $order->project_status,
                        'payment_status' => $order->payment_status,
                        'amount_paid_ngn' => (float) ($existingInvoice?->amount_paid_ngn ?? $order->total_ngn),
                        'balance_ngn' => (float) ($existingInvoice?->balance_ngn ?? 0),
                        'total_ngn' => (float) $order->total_ngn,
                        'payment_type' => $order->metadata['payment_type'] ?? 'full',
                        'project_name' => $order->metadata['project_name'] ?? $order->projectType->title,
                        'duplicate' => true,
                    ],
                ]);
            }

            $verification = $this->paymentService->verifyPayment($order->payment_gateway, $request->reference);

            Log::info('Payment verification result', [
                'order_id' => $request->order_id,
                'reference' => $request->reference,
                'status' => $verification['status'],
            ]);

            if ($verification['status'] === 'success' || $verification['status'] === 'completed') {
                $this->processVerifiedPayment($order, $request->reference, $verification);

                $order->refresh();
                $invoice = $order->invoices()->latest()->first();
                $receipt = $order->receipts()->latest()->first();
                $metadata = $order->metadata ?? [];
                $paymentType = $metadata['payment_type'] ?? 'full';
                $projectName = $metadata['project_name'] ?? $order->projectType->title;
                $balanceNgn = $order->total_ngn - ($paymentType === 'deposit' ? $order->total_ngn / 2 : $order->total_ngn);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'project_number' => $order->project_number,
                        'project_status' => $order->project_status,
                        'invoice_number' => $invoice?->invoice_number,
                        'receipt_number' => $receipt?->receipt_number,
                        'status' => $order->status,
                        'payment_status' => $order->payment_status,
                        'amount_paid_ngn' => (float) ($invoice?->amount_paid_ngn ?? $order->total_ngn),
                        'balance_ngn' => (float) ($balanceNgn),
                        'total_ngn' => (float) $order->total_ngn,
                        'payment_type' => $paymentType,
                        'project_name' => $projectName,
                        'created_at' => $order->created_at->toIso8601String(),
                    ],
                ]);
            }

            Log::warning('Payment verification unsuccessful', [
                'order_id' => $request->order_id,
                'status' => $verification['status'],
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Payment verification failed.',
                'data' => ['status' => $verification['status']],
            ], 400);
        } catch (\RuntimeException $e) {
            DB::rollBack();
            Log::error('Payment verification failed', [
                'order_id' => $request->order_id,
                'reference' => $request->reference,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function paymentCallback(Request $request, string $id)
    {
        Log::info('Payment callback received', [
            'order_id' => $id,
            'query_params' => $request->all(),
        ]);

        try {
            $order = ServiceOrder::findOrFail($id);

            $reference = $request->query('reference') ?? $request->query('trxref');

            if (!$reference) {
                Log::warning('Payment callback missing reference', ['order_id' => $id]);
                $frontendUrl = config('app.frontend_url') . '/hire/order/' . $id . '/success?error=missing_reference';
                return redirect()->away($frontendUrl);
            }

            Log::info('Payment callback verifying', [
                'order_id' => $id,
                'reference' => $reference,
                'order_status' => $order->payment_status,
            ]);

            if ($order->payment_status === 'paid' || $order->payment_status === 'completed') {
                Log::info('Payment callback - already paid', ['order_id' => $id]);
                $frontendUrl = config('app.frontend_url') . '/hire/order/' . $id . '/success?reference=' . $reference;
                return redirect()->away($frontendUrl);
            }

            $verification = $this->paymentService->verifyPayment($order->payment_gateway, $reference);

            Log::info('Payment callback verification result', [
                'order_id' => $id,
                'reference' => $reference,
                'status' => $verification['status'],
            ]);

            if ($verification['status'] === 'completed') {
                $this->processVerifiedPayment($order, $reference, $verification);

                $frontendUrl = config('app.frontend_url') . '/hire/order/' . $id . '/success?reference=' . $reference;
                Log::info('Payment callback redirecting to success', [
                    'order_id' => $id,
                    'redirect_url' => $frontendUrl,
                ]);
                return redirect()->away($frontendUrl);
            }

            if ($verification['status'] === 'failed') {
                $order->update(['payment_status' => 'failed']);
                $frontendUrl = config('app.frontend_url') . '/hire/order/' . $id . '/success?error=payment_failed';
                Log::warning('Payment callback - payment failed', ['order_id' => $id]);
                return redirect()->away($frontendUrl);
            }

            $frontendUrl = config('app.frontend_url') . '/hire/order/' . $id . '/success?error=verification_pending';
            Log::info('Payment callback - verification pending', ['order_id' => $id]);
            return redirect()->away($frontendUrl);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Payment callback - order not found', ['order_id' => $id]);
            $frontendUrl = config('app.frontend_url') . '/hire/order/' . $id . '/success?error=order_not_found';
            return redirect()->away($frontendUrl);
        } catch (\RuntimeException $e) {
            Log::error('Payment callback error', [
                'order_id' => $id,
                'error' => $e->getMessage(),
            ]);
            $frontendUrl = config('app.frontend_url') . '/hire/order/' . $id . '/success?error=verification_failed';
            return redirect()->away($frontendUrl);
        }
    }

    public function processVerifiedPayment(ServiceOrder $order, string $reference, array $verification): void
    {
        DB::beginTransaction();
        try {
            // Lock the order row to prevent race conditions with webhook
            $locked = ServiceOrder::where('id', $order->id)->lockForUpdate()->first();

            if (!$locked || $locked->payment_status === 'paid' || $locked->payment_status === 'completed') {
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
                'payment_status' => $balanceNgn > 0 ? 'partially_paid' : 'paid',
                'status' => 'active',
                'project_number' => $projectNumber,
                'project_status' => 'pending_review',
                'project_created_at' => $now,
            ]);

            $invoiceNumber = 'INV-SVC-' . strtoupper(substr(uniqid(), -8));
            $invoice = ServiceInvoice::create([
                'invoice_number' => $invoiceNumber,
                'service_order_id' => $order->id,
                'user_id' => $order->user_id,
                'status' => $balanceNgn > 0 ? 'partially_paid' : 'paid',
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
                'due_date' => $now->copy()->addDays(3),
                'status' => 'pending',
                'deliverables' => ['Kickoff meeting', 'Final scope agreement', 'Timeline confirmation'],
            ],
            [
                'title' => 'Design & Planning',
                'milestone_type' => 'design',
                'description' => 'UI/UX design, system architecture, and technical planning.',
                'sort_order' => 6,
                'due_date' => $now->copy()->addDays(7),
                'status' => 'pending',
                'deliverables' => ['Wireframes / Mockups', 'Technical architecture', 'Design approval'],
            ],
            [
                'title' => 'Development',
                'milestone_type' => 'development',
                'description' => 'Core development and feature implementation.',
                'sort_order' => 7,
                'due_date' => $now->copy()->addDays(14),
                'status' => 'pending',
                'deliverables' => ['Feature implementation', 'Code repository', 'Progress updates'],
            ],
            [
                'title' => 'Testing & QA',
                'milestone_type' => 'testing',
                'description' => 'Comprehensive testing, bug fixes, and quality assurance.',
                'sort_order' => 8,
                'due_date' => $now->copy()->addDays(21),
                'status' => 'pending',
                'deliverables' => ['Test reports', 'Bug fixes', 'Performance optimization'],
            ],
            [
                'title' => 'Client Review',
                'milestone_type' => 'review',
                'description' => 'Client reviews the completed work and provides feedback.',
                'sort_order' => 9,
                'due_date' => $now->copy()->addDays(24),
                'status' => 'pending',
                'deliverables' => ['Client demo', 'Feedback collection', 'Revision implementation'],
            ],
            [
                'title' => 'Deployment',
                'milestone_type' => 'deployment',
                'description' => 'Production deployment and final delivery.',
                'sort_order' => 10,
                'due_date' => $now->copy()->addDays(28),
                'status' => 'pending',
                'deliverables' => ['Production deployment', 'Documentation', 'Handover'],
            ],
            [
                'title' => 'Completed',
                'milestone_type' => 'completion',
                'description' => 'Project completed and handed over. Post-delivery support begins.',
                'sort_order' => 11,
                'due_date' => $now->copy()->addDays(30),
                'status' => 'pending',
                'deliverables' => ['Final sign-off', 'Source code delivery', 'Support period starts'],
            ],
        ];

        // Add a final delivery milestone if there's a balance
        if ($balanceNgn > 0) {
            $milestones[] = [
                'title' => 'Final Delivery (Balance Payment)',
                'milestone_type' => 'payment',
                'description' => 'Final delivery upon completion of balance payment.',
                'sort_order' => 12,
                'due_date' => $now->copy()->addDays(32),
                'status' => 'pending',
                'deliverables' => ['Balance payment', 'Final delivery', 'Handover documentation'],
            ];
        }

        foreach ($milestones as $ms) {
            Milestone::create(array_merge($ms, [
                'service_order_id' => $order->id,
                'is_automatic' => true,
            ]));
        }
    }

    public function myOrders(Request $request)
    {
        $orders = ServiceOrder::with(['service', 'projectType', 'package', 'addOns.addOn'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($o) {
                $metadata = $o->metadata ?? [];
                return [
                    'id' => $o->id,
                    'order_number' => $o->order_number,
                    'project_number' => $o->project_number,
                    'service' => $o->service->title ?? 'Unknown',
                    'project' => $o->projectType->title ?? 'Unknown',
                    'package' => $o->package->name ?? 'Unknown',
                    'total_ngn' => (float) $o->total_ngn,
                    'total_usd' => (float) $o->total_usd,
                    'status' => $o->status,
                    'project_status' => $o->project_status,
                    'payment_status' => $o->payment_status,
                    'project_name' => $metadata['project_name'] ?? null,
                    'created_at' => $o->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function showOrder(Request $request, $id)
    {
        $order = ServiceOrder::with([
            'service', 'projectType', 'package',
            'addOns.addOn', 'invoices', 'payments',
            'milestones', 'messages.user', 'files', 'activityLogs.user',
            'receipts', 'projectManager.profile',
        ])->findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    // --- Workspace endpoints ---

    public function workspace(Request $request, $id)
    {
        $order = ServiceOrder::with([
            'service', 'projectType', 'package',
            'addOns.addOn', 'invoices', 'payments',
            'milestones' => fn ($q) => $q->orderBy('sort_order'),
            'messages.user.profile',
            'files',
            'activityLogs.user.profile' => fn ($q) => $q->orderBy('created_at', 'desc')->limit(50),
            'receipts',
            'projectManager.profile',
        ])->findOrFail($id);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $metadata = $order->metadata ?? [];
        $amountPaid = $order->payments->whereIn('status', ['success', 'completed'])->sum('amount_ngn');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'project_number' => $order->project_number,
                'project_name' => $metadata['project_name'] ?? $order->projectType->title,
                'status' => $order->status,
                'project_status' => $order->project_status,
                'payment_status' => $order->payment_status,
                'total_ngn' => (float) $order->total_ngn,
                'amount_paid_ngn' => (float) $amountPaid,
                'balance_ngn' => (float) ($order->total_ngn - $amountPaid),
                'service' => $order->service,
                'projectType' => $order->projectType,
                'package' => $order->package,
                'addOns' => $order->addOns,
                'billing_details' => $order->billing_details,
                'project_created_at' => $order->project_created_at,
                'kickoff_at' => $order->kickoff_at,
                'completed_at' => $order->completed_at,
                'created_at' => $order->created_at,
                'milestones' => $order->milestones,
                'invoices' => $order->invoices,
                'payments' => $order->payments,
                'receipts' => $order->receipts,
                'messages' => $order->messages,
                'files' => $order->files,
                'activityLogs' => $order->activityLogs,
                'projectManager' => $order->projectManager,
            ],
        ]);
    }

    public function milestones(Request $request, $id)
    {
        $order = ServiceOrder::findOrFail($id);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $milestones = $order->milestones()->orderBy('sort_order')->get();

        $completedCount = $milestones->where('status', 'completed')->count();
        $totalCount = $milestones->count();
        $progress = $totalCount > 0 ? round(($completedCount / $totalCount) * 100) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'milestones' => $milestones,
                'progress' => $progress,
                'completed' => $completedCount,
                'total' => $totalCount,
            ],
        ]);
    }

    public function activityLog(Request $request, $id)
    {
        $order = ServiceOrder::findOrFail($id);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $logs = ServiceActivityLog::with('user.profile')
            ->where('service_order_id', $id)
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    public function downloadInvoice(Request $request, $id, $invoiceId)
    {
        $order = ServiceOrder::findOrFail($id);
        $invoice = ServiceInvoice::where('service_order_id', $id)->findOrFail($invoiceId);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        // Return invoice data for PDF generation on frontend
        return response()->json([
            'success' => true,
            'data' => [
                'invoice' => $invoice,
                'order' => [
                    'order_number' => $order->order_number,
                    'project_number' => $order->project_number,
                    'service' => $order->service?->title,
                    'project_type' => $order->projectType?->title,
                    'package' => $order->package?->name,
                    'billing_details' => $order->billing_details,
                    'metadata' => $order->metadata,
                ],
            ],
        ]);
    }

    public function downloadReceipt(Request $request, $id, $receiptId)
    {
        $order = ServiceOrder::findOrFail($id);
        $receipt = ServiceReceipt::where('service_order_id', $id)->findOrFail($receiptId);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'receipt' => $receipt,
                'order' => [
                    'order_number' => $order->order_number,
                    'project_number' => $order->project_number,
                    'service' => $order->service?->title,
                    'project_type' => $order->projectType?->title,
                    'package' => $order->package?->name,
                    'billing_details' => $order->billing_details,
                ],
            ],
        ]);
    }
}
