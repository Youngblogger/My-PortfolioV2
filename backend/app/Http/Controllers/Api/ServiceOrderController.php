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
use App\Models\Service;
use App\Models\ProjectType;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

            $payment = $this->paymentService->initializePayment(
                $request->payment_gateway,
                [
                    'email' => $request->billing['email'] ?? $request->user()->email,
                    'amount' => $amountDueNgn,
                    'currency' => 'NGN',
                    'reference' => 'SVC-' . strtoupper(uniqid()),
                    'metadata' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'payment_type' => $request->payment_type,
                        'customer_name' => $request->billing['full_name'] ?? $request->user()->name,
                    ],
                    'callback_url' => config('app.frontend_url') . '/hire/order/' . $order->id . '/success',
                ]
            );

            $order->update([
                'transaction_reference' => $payment['reference'],
                'payment_status' => 'processing',
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
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        try {
            $order = ServiceOrder::with(['service', 'projectType', 'package', 'addOns', 'user.profile'])
                ->findOrFail($request->order_id);

            if ($order->user_id !== $request->user()->id) {
                return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
            }

            // Prevent duplicate processing
            if ($order->payment_status === 'paid' || $order->payment_status === 'completed') {
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

            if ($verification['status'] === 'success') {
                DB::beginTransaction();

                $now = now();
                $metadata = $order->metadata ?? [];
                $paymentType = $metadata['payment_type'] ?? 'full';
                $amountPaidNgn = $paymentType === 'deposit' ? $order->total_ngn / 2 : $order->total_ngn;
                $amountPaidUsd = $paymentType === 'deposit' ? $order->total_usd / 2 : $order->total_usd;
                $balanceNgn = $order->total_ngn - $amountPaidNgn;
                $balanceUsd = $order->total_usd - $amountPaidUsd;
                $projectName = $metadata['project_name'] ?? $order->projectType->title;

                // 1. Update order with payment and project info
                $projectNumber = 'PRJ-' . strtoupper(substr(uniqid(), -8));

                $order->update([
                    'payment_status' => $balanceNgn > 0 ? 'partially_paid' : 'paid',
                    'status' => 'active',
                    'project_number' => $projectNumber,
                    'project_status' => 'pending_review',
                    'project_created_at' => $now,
                ]);

                // 2. Create invoice
                $invoiceNumber = 'INV-SVC-' . strtoupper(substr(uniqid(), -8));

                $invoice = ServiceInvoice::create([
                    'invoice_number' => $invoiceNumber,
                    'service_order_id' => $order->id,
                    'user_id' => $request->user()->id,
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

                // 3. Create payment record
                $payment = ServicePayment::create([
                    'service_order_id' => $order->id,
                    'service_invoice_id' => $invoice->id,
                    'user_id' => $request->user()->id,
                    'reference' => $request->reference,
                    'gateway' => $order->payment_gateway,
                    'amount_ngn' => $amountPaidNgn,
                    'amount_usd' => $amountPaidUsd,
                    'currency' => 'NGN',
                    'status' => 'completed',
                    'payment_type' => $paymentType,
                    'gateway_response' => $verification,
                    'paid_at' => $now,
                ]);

                // 4. Create receipt
                $receiptNumber = 'RCT-SVC-' . strtoupper(substr(uniqid(), -8));

                ServiceReceipt::create([
                    'receipt_number' => $receiptNumber,
                    'service_order_id' => $order->id,
                    'service_invoice_id' => $invoice->id,
                    'service_payment_id' => $payment->id,
                    'user_id' => $request->user()->id,
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
                        'payment_reference' => $request->reference,
                    ],
                ]);

                // 5. Create full 11-milestone project timeline
                $this->createProjectTimeline($order, $now, $balanceNgn);

                // 6. Activity logs
                ServiceActivityLog::create([
                    'service_order_id' => $order->id,
                    'user_id' => $request->user()->id,
                    'action' => 'payment_verified',
                    'description' => 'Payment of ' . number_format($amountPaidNgn, 2) . ' NGN verified successfully.',
                    'metadata' => ['gateway' => $order->payment_gateway, 'reference' => $request->reference],
                ]);

                ServiceActivityLog::create([
                    'service_order_id' => $order->id,
                    'user_id' => $request->user()->id,
                    'action' => 'invoice_generated',
                    'description' => 'Invoice ' . $invoiceNumber . ' generated.',
                ]);

                ServiceActivityLog::create([
                    'service_order_id' => $order->id,
                    'user_id' => $request->user()->id,
                    'action' => 'receipt_generated',
                    'description' => 'Receipt ' . $receiptNumber . ' generated.',
                ]);

                ServiceActivityLog::create([
                    'service_order_id' => $order->id,
                    'user_id' => $request->user()->id,
                    'action' => 'project_created',
                    'description' => 'Project ' . $projectNumber . ' created and workspace provisioned.',
                    'metadata' => ['project_number' => $projectNumber],
                ]);

                ServiceActivityLog::create([
                    'service_order_id' => $order->id,
                    'user_id' => $request->user()->id,
                    'action' => 'timeline_initialized',
                    'description' => 'Project timeline with 11 milestones initialized.',
                ]);

                // 7. Client notification
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

                // 8. Admin notifications
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

                DB::commit();

                return response()->json([
                    'success' => true,
                    'data' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'project_number' => $projectNumber,
                        'project_status' => 'pending_review',
                        'invoice_number' => $invoiceNumber,
                        'receipt_number' => $receiptNumber,
                        'status' => 'active',
                        'payment_status' => $balanceNgn > 0 ? 'partially_paid' : 'paid',
                        'amount_paid_ngn' => (float) $amountPaidNgn,
                        'balance_ngn' => (float) $balanceNgn,
                        'total_ngn' => (float) $order->total_ngn,
                        'payment_type' => $paymentType,
                        'project_name' => $projectName,
                    ],
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => 'Payment verification failed.',
                'data' => ['status' => $verification['status']],
            ], 400);
        } catch (\RuntimeException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
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
