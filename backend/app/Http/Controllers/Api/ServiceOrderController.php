<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\OrderAddOn;
use App\Models\ServiceInvoice;
use App\Models\ServicePayment;
use App\Models\ServiceActivityLog;
use App\Models\Milestone;
use App\Models\AddOn;
use App\Models\Package;
use App\Models\Service;
use App\Models\ProjectType;
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

    public function placeOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_id' => ['required', 'string', 'exists:services,id'],
            'project_type_id' => ['required', 'string', 'exists:project_types,id'],
            'package_id' => ['required', 'string', 'exists:packages,id'],
            'add_on_ids' => ['nullable', 'array'],
            'add_on_ids.*' => ['string', 'exists:add_ons,id'],
            'payment_gateway' => ['required', 'string', 'in:paystack,flutterwave'],
            'payment_type' => ['required', 'string', 'in:full,deposit'],
            'billing' => ['required', 'array'],
            'billing.full_name' => ['required', 'string', 'max:255'],
            'billing.email' => ['required', 'email', 'max:255'],
            'billing.phone' => ['nullable', 'string', 'max:20'],
            'billing.country' => ['nullable', 'string', 'max:100'],
            'billing.state' => ['nullable', 'string', 'max:100'],
            'billing.city' => ['nullable', 'string', 'max:100'],
            'billing.address' => ['nullable', 'string', 'max:500'],
            'billing.company' => ['nullable', 'string', 'max:255'],
            'project_name' => ['required', 'string', 'max:255'],
            'project_description' => ['nullable', 'string'],
            'preferred_start_date' => ['nullable', 'date'],
            'reference_links' => ['nullable', 'array'],
            'reference_links.*' => ['url'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

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
            $order = ServiceOrder::with(['service', 'projectType', 'package', 'addOns'])
                ->findOrFail($request->order_id);

            if ($order->user_id !== $request->user()->id) {
                return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
            }

            $verification = $this->paymentService->verifyPayment($order->payment_gateway, $request->reference);

            if ($verification['status'] === 'success') {
                DB::beginTransaction();

                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'active',
                ]);

                $invoiceNumber = 'INV-SVC-' . strtoupper(substr(uniqid(), -8));

                $metadata = $order->metadata ?? [];
                $paymentType = $metadata['payment_type'] ?? 'full';
                $amountPaidNgn = $paymentType === 'deposit' ? $order->total_ngn / 2 : $order->total_ngn;
                $amountPaidUsd = $paymentType === 'deposit' ? $order->total_usd / 2 : $order->total_usd;
                $balanceNgn = $order->total_ngn - $amountPaidNgn;
                $balanceUsd = $order->total_usd - $amountPaidUsd;

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
                    'paid_at' => now(),
                ]);

                ServicePayment::create([
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
                    'paid_at' => now(),
                ]);

                $projectName = $metadata['project_name'] ?? $order->projectType->title;

                Milestone::create([
                    'service_order_id' => $order->id,
                    'title' => 'Project Kickoff',
                    'description' => 'Initial project kickoff meeting and planning.',
                    'status' => 'pending',
                    'sort_order' => 1,
                    'due_date' => now()->addDays(3),
                    'deliverables' => ['Project brief', 'Timeline agreement', 'Resource allocation'],
                ]);

                Milestone::create([
                    'service_order_id' => $order->id,
                    'title' => 'Design & Planning',
                    'description' => 'UI/UX design, architecture planning, and wireframes.',
                    'status' => 'pending',
                    'sort_order' => 2,
                    'due_date' => now()->addDays(7),
                    'deliverables' => ['Wireframes', 'Design mockups', 'Technical architecture'],
                ]);

                Milestone::create([
                    'service_order_id' => $order->id,
                    'title' => 'Development',
                    'description' => 'Core development and implementation.',
                    'status' => 'pending',
                    'sort_order' => 3,
                    'due_date' => now()->addDays(14),
                    'deliverables' => ['Working prototype', 'Code repository', 'Progress report'],
                ]);

                Milestone::create([
                    'service_order_id' => $order->id,
                    'title' => 'Testing & Deployment',
                    'description' => 'Quality assurance, testing, and production deployment.',
                    'status' => 'pending',
                    'sort_order' => 4,
                    'due_date' => now()->addDays(21),
                    'deliverables' => ['Test reports', 'Deployed application', 'Documentation'],
                ]);

                if ($balanceNgn > 0) {
                    Milestone::create([
                        'service_order_id' => $order->id,
                        'title' => 'Final Delivery',
                        'description' => 'Final delivery upon completion of balance payment.',
                        'status' => 'pending',
                        'sort_order' => 5,
                        'due_date' => now()->addDays(28),
                        'deliverables' => ['Final delivery', 'Source code', 'Handover documentation'],
                    ]);
                }

                ServiceActivityLog::create([
                    'service_order_id' => $order->id,
                    'user_id' => $request->user()->id,
                    'action' => 'payment_verified',
                    'description' => 'Payment of ' . number_format($amountPaidNgn, 2) . ' NGN verified successfully.',
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'data' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'invoice_number' => $invoiceNumber,
                        'status' => 'active',
                        'payment_status' => $balanceNgn > 0 ? 'partially_paid' : 'paid',
                        'amount_paid_ngn' => $amountPaidNgn,
                        'balance_ngn' => $balanceNgn,
                        'total_ngn' => $order->total_ngn,
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
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
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
                    'service' => $o->service->title ?? 'Unknown',
                    'project' => $o->projectType->title ?? 'Unknown',
                    'package' => $o->package->name ?? 'Unknown',
                    'total_ngn' => (float) $o->total_ngn,
                    'total_usd' => (float) $o->total_usd,
                    'status' => $o->status,
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
        ])->findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }
}
