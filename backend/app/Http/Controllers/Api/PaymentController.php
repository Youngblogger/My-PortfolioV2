<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    public function __construct(
        private CheckoutService $checkoutService,
    ) {}

    public function initialize(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:3'],
            'gateway' => ['required', 'string', 'in:paystack,flutterwave'],
            'course_id' => ['nullable', 'string', 'exists:courses,id'],
            'metadata' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        try {
            $reference = \generateReference('PAY');
            $callbackUrl = config('app.url') . '/academy/payment/processing?reference=' . $reference . '&gateway=' . $request->gateway;

            $paymentService = app(\App\Services\Payments\PaymentService::class);

            $result = $paymentService->initializePayment($request->gateway, [
                'email' => $request->email,
                'amount' => $request->amount,
                'currency' => $request->currency ?? 'NGN',
                'reference' => $reference,
                'callback_url' => $callbackUrl,
                'metadata' => $request->metadata ?? [],
            ]);

            Transaction::create([
                'user_id' => $request->user()->id,
                'transaction_reference' => $reference,
                'payment_gateway' => $request->gateway,
                'amount' => $request->amount,
                'currency' => $request->currency ?? 'NGN',
                'status' => 'pending',
                'metadata' => $request->metadata ?? [],
            ]);

            return response()->json([
                'success' => true,
                'reference' => $reference,
                'authorization_url' => $result['authorization_url'],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reference' => ['required', 'string'],
            'gateway' => ['required', 'string', 'in:paystack,flutterwave'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        try {
            $result = $this->checkoutService->verifyAndComplete(
                $request->reference,
                $request->gateway
            );

            if ($result['status'] === 'completed') {
                return response()->json([
                    'success' => true,
                    'status' => 'completed',
                    'transaction' => $result['transaction'],
                    'enrollment' => $result['enrollment'],
                    'invoice' => $result['invoice'] ?? null,
                    'receipt' => $result['receipt'] ?? null,
                ]);
            }

            if ($result['status'] === 'pending') {
                return response()->json([
                    'success' => false,
                    'status' => 'pending',
                    'message' => 'Payment is still being processed',
                ]);
            }

            return response()->json([
                'success' => false,
                'status' => $result['status'],
                'error' => 'Payment verification failed',
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 404);
        }
    }
}
