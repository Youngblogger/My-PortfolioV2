<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreateOrderRequest;
use App\Models\ServiceOrder;
use App\Models\OrderAddOn;
use App\Models\AddOn;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\Payments\PaymentService;
use App\Services\ServiceOrderService;

class ServiceOrderController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private ServiceOrderService $serviceOrderService,
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
