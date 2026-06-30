<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreateOrderRequest;
use App\Models\ServiceOrder;
use App\Models\OrderAddOn;
use App\Models\AddOn;
use App\Models\Package;
use App\Models\ServiceActivityLog;
use App\Models\ServiceInvoice;
use App\Models\ServicePayment;
use App\Models\ServiceReceipt;
use App\Models\ServiceMessage;
use App\Models\ServiceFile;
use App\Models\Milestone;
use App\Models\TeamAssignment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\Payments\PaymentService;
use App\Services\ServiceOrderService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ServiceOrderController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private ServiceOrderService $serviceOrderService,
    ) {}

    public function myOrders(Request $request)
    {
        $orders = ServiceOrder::with(['service', 'projectType', 'package', 'addOns'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $metadata = $order->metadata ?? [];

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'project_number' => $order->project_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'project_status' => $order->project_status,
                    'service_name' => $order->service?->title,
                    'project_type' => $order->projectType?->title,
                    'package_name' => $order->package?->name,
                    'total_ngn' => (float) $order->total_ngn,
                    'total_usd' => (float) $order->total_usd,
                    'add_ons' => $order->addOns->map(fn ($a) => [
                        'name' => $a->name,
                        'price_ngn' => (float) $a->price_ngn,
                        'price_usd' => (float) $a->price_usd,
                    ]),
                    'project_name' => $metadata['project_name'] ?? null,
                    'payment_type' => $metadata['payment_type'] ?? 'full',
                    'created_at' => $order->created_at->toIso8601String(),
                    'updated_at' => $order->updated_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function showOrder(Request $request, string $id)
    {
        $order = ServiceOrder::with([
            'service', 'projectType', 'package', 'addOns',
            'invoices', 'payments', 'milestones',
            'teamAssignments.teamMember.user.profile',
        ])->findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'service' => ['title' => $order->service?->title, 'slug' => $order->service?->slug],
                'projectType' => ['title' => $order->projectType?->title, 'slug' => $order->projectType?->slug],
                'package' => ['name' => $order->package?->name, 'slug' => $order->package?->slug],
                'total_ngn' => (float) $order->total_ngn,
                'total_usd' => (float) $order->total_usd,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'billing_details' => $order->billing_details ?? [],
                'metadata' => $order->metadata ?? [],
                'addOns' => $order->addOns->map(fn ($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'price_ngn' => (float) $a->price_ngn,
                ]),
                'invoices' => $order->invoices ?? [],
                'payments' => $order->payments ?? [],
                'milestones' => $order->milestones ?? [],
                'teamAssignments' => $order->teamAssignments?->map(fn ($ta) => [
                    'id' => $ta->id,
                    'role' => $ta->role,
                    'teamMember' => $ta->teamMember ? [
                        'id' => $ta->teamMember->id,
                        'title' => $ta->teamMember->title,
                        'avatar_url' => $ta->teamMember->avatar_url,
                        'user' => $ta->teamMember->user ? [
                            'profile' => $ta->teamMember->user->profile ? [
                                'full_name' => $ta->teamMember->user->profile->full_name,
                                'avatar_url' => $ta->teamMember->user->profile->avatar_url,
                            ] : null,
                        ] : null,
                    ] : null,
                ]),
                'created_at' => $order->created_at->toIso8601String(),
            ],
        ]);
    }

    public function workspace(Request $request, string $id)
    {
        $order = ServiceOrder::with([
            'service', 'projectType', 'package', 'addOns',
            'milestones', 'invoices', 'payments', 'receipts',
            'activityLogs.user.profile',
            'messages.user.profile',
            'files',
            'teamAssignments.teamMember.user.profile',
        ])->findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $metadata = $order->metadata ?? [];
        $paymentType = $metadata['payment_type'] ?? 'full';
        $amountPaidNgn = $paymentType === 'deposit' ? $order->total_ngn / 2 : $order->total_ngn;
        $balanceNgn = $order->total_ngn - $amountPaidNgn;

        $projectManager = $order->teamAssignments
            ?->where('role', 'project_manager')
            ?->first()
            ?->teamMember;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'project_number' => $order->project_number,
                'project_name' => $metadata['project_name'] ?? $order->projectType?->title,
                'status' => $order->status,
                'project_status' => $order->project_status,
                'payment_status' => $order->payment_status,
                'total_ngn' => (float) $order->total_ngn,
                'amount_paid_ngn' => $amountPaidNgn,
                'balance_ngn' => $balanceNgn,
                'service' => ['title' => $order->service?->title, 'slug' => $order->service?->slug],
                'projectType' => ['title' => $order->projectType?->title, 'slug' => $order->projectType?->slug],
                'package' => ['name' => $order->package?->name, 'slug' => $order->package?->slug],
                'addOns' => $order->addOns->map(fn ($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'price_ngn' => (float) $a->price_ngn,
                ]),
                'billing_details' => $order->billing_details ?? [],
                'project_created_at' => $order->project_created_at?->toIso8601String(),
                'kickoff_at' => $order->kickoff_at?->toIso8601String(),
                'completed_at' => $order->completed_at?->toIso8601String(),
                'created_at' => $order->created_at->toIso8601String(),
                'milestones' => $order->milestones->map(fn ($m) => [
                    'id' => $m->id,
                    'service_order_id' => $m->service_order_id,
                    'title' => $m->title,
                    'description' => $m->description,
                    'milestone_type' => $m->milestone_type,
                    'status' => $m->status,
                    'is_automatic' => (bool) $m->is_automatic,
                    'sort_order' => $m->sort_order,
                    'due_date' => $m->due_date?->toIso8601String(),
                    'completed_at' => $m->completed_at?->toIso8601String(),
                    'deliverables' => $m->deliverables,
                    'completion_notes' => $m->completion_notes,
                    'created_at' => $m->created_at->toIso8601String(),
                    'review_requested_at' => $m->review_requested_at?->toIso8601String(),
                    'review_status' => $m->review_status,
                    'review_feedback' => $m->review_feedback,
                ]),
                'invoices' => $order->invoices->map(fn ($inv) => [
                    'id' => $inv->id,
                    'invoice_number' => $inv->invoice_number,
                    'status' => $inv->status,
                    'total_ngn' => (float) $inv->total_ngn,
                    'amount_paid_ngn' => (float) $inv->amount_paid_ngn,
                    'balance_ngn' => (float) $inv->balance_ngn,
                    'payment_type' => $inv->payment_type,
                    'paid_at' => $inv->paid_at?->toIso8601String(),
                    'created_at' => $inv->created_at->toIso8601String(),
                ]),
                'payments' => $order->payments->map(fn ($p) => [
                    'id' => $p->id,
                    'reference' => $p->reference,
                    'gateway' => $p->gateway,
                    'amount_ngn' => (float) $p->amount_ngn,
                    'status' => $p->status,
                    'payment_type' => $p->payment_type,
                    'paid_at' => $p->paid_at?->toIso8601String(),
                    'created_at' => $p->created_at->toIso8601String(),
                ]),
                'receipts' => $order->receipts->map(fn ($r) => [
                    'id' => $r->id,
                    'receipt_number' => $r->receipt_number,
                    'amount_ngn' => (float) $r->amount_ngn,
                    'currency' => $r->currency,
                    'payment_gateway' => $r->payment_gateway,
                    'status' => $r->status,
                    'created_at' => $r->created_at->toIso8601String(),
                ]),
                'activityLogs' => $order->activityLogs->map(fn ($log) => [
                    'id' => $log->id,
                    'user_id' => $log->user_id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'metadata' => $log->metadata,
                    'created_at' => $log->created_at->toIso8601String(),
                    'user' => $log->user ? [
                        'profile' => $log->user->profile ? [
                            'full_name' => $log->user->profile->full_name,
                            'avatar_url' => $log->user->profile->avatar_url,
                        ] : null,
                    ] : null,
                ]),
                'projectManager' => $projectManager ? [
                    'id' => $projectManager->id,
                    'profile' => $projectManager->user?->profile ? [
                        'full_name' => $projectManager->user->profile->full_name,
                        'avatar_url' => $projectManager->user->profile->avatar_url,
                    ] : null,
                ] : null,
                'messages' => $order->messages->map(fn ($msg) => [
                    'id' => $msg->id,
                    'service_order_id' => $msg->service_order_id,
                    'user_id' => $msg->user_id,
                    'message' => $msg->message,
                    'type' => $msg->type,
                    'is_important' => (bool) $msg->is_important,
                    'created_at' => $msg->created_at->toIso8601String(),
                    'user' => $msg->user ? [
                        'profile' => $msg->user->profile ? [
                            'full_name' => $msg->user->profile->full_name,
                            'avatar_url' => $msg->user->profile->avatar_url,
                        ] : null,
                    ] : null,
                ]),
                'files' => $order->files->map(fn ($f) => [
                    'id' => $f->id,
                    'service_order_id' => $f->service_order_id,
                    'user_id' => $f->user_id,
                    'original_name' => $f->original_name,
                    'file_path' => $f->file_path,
                    'mime_type' => $f->mime_type,
                    'file_size' => $f->file_size,
                    'type' => $f->type,
                    'created_at' => $f->created_at->toIso8601String(),
                ]),
            ],
        ]);
    }

    public function milestones(Request $request, string $id)
    {
        $order = ServiceOrder::findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $milestones = Milestone::where('service_order_id', $id)
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'service_order_id' => $m->service_order_id,
                'title' => $m->title,
                'description' => $m->description,
                'milestone_type' => $m->milestone_type,
                'status' => $m->status,
                'is_automatic' => (bool) $m->is_automatic,
                'sort_order' => $m->sort_order,
                'due_date' => $m->due_date?->toIso8601String(),
                'completed_at' => $m->completed_at?->toIso8601String(),
                'deliverables' => $m->deliverables,
                'completion_notes' => $m->completion_notes,
                'created_at' => $m->created_at->toIso8601String(),
                'review_requested_at' => $m->review_requested_at?->toIso8601String(),
                'review_status' => $m->review_status,
                'review_feedback' => $m->review_feedback,
            ]);

        $completed = $milestones->filter(fn ($m) => $m['status'] === 'completed')->count();
        $progress = $milestones->count() > 0 ? round(($completed / $milestones->count()) * 100) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'milestones' => $milestones,
                'progress' => $progress,
            ],
        ]);
    }

    public function activityLog(Request $request, string $id)
    {
        $order = ServiceOrder::findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
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

    public function downloadInvoice(Request $request, string $id, string $invoiceId)
    {
        $order = ServiceOrder::findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $invoice = ServiceInvoice::where('service_order_id', $id)
            ->where('id', $invoiceId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }

    public function downloadReceipt(Request $request, string $id, string $receiptId)
    {
        $order = ServiceOrder::with(['service', 'projectType', 'package'])
            ->findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $receipt = ServiceReceipt::with('servicePayment')
            ->where('service_order_id', $id)
            ->where('id', $receiptId)
            ->firstOrFail();

        try {
            $pdf = Pdf::loadView('pdf.service-receipt', [
                'receipt' => $receipt,
                'order' => $order,
            ]);
            $pdf->setPaper('A4');

            return response($pdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="receipt-' . $receipt->receipt_number . '.pdf"',
                'Cache-Control' => 'no-cache',
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Receipt PDF generation failed', [
                'order_id' => $id,
                'receipt_id' => $receiptId,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate receipt PDF.',
            ], 500);
        }
    }

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
                $this->serviceOrderService->processVerifiedPayment($order, $request->reference, $verification);

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
                $this->serviceOrderService->processVerifiedPayment($order, $reference, $verification);

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
}
