<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CheckoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CheckoutController extends Controller
{
    public function __construct(
        private CheckoutService $checkoutService,
    ) {}

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => ['required', 'string', 'exists:courses,id'],
            'tier_id' => ['nullable', 'string', 'exists:pricing_tiers,id'],
            'payment_gateway' => ['required', 'string', 'in:paystack,flutterwave'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'billing' => ['required', 'array'],
            'billing.full_name' => ['required', 'string', 'max:255'],
            'billing.email' => ['required', 'email', 'max:255'],
            'billing.phone' => ['nullable', 'string', 'max:20'],
            'billing.country' => ['nullable', 'string', 'max:100'],
            'billing.state' => ['nullable', 'string', 'max:100'],
            'billing.city' => ['nullable', 'string', 'max:100'],
            'billing.address' => ['nullable', 'string', 'max:500'],
            'billing.company' => ['nullable', 'string', 'max:255'],
            'billing.tax_id' => ['nullable', 'string', 'max:50'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        try {
            $result = $this->checkoutService->processCheckout(
                $request->all(),
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'reference' => $result['reference'],
                'authorization_url' => $result['authorization_url'],
                'gateway' => $result['gateway'],
            ]);
        } catch (\RuntimeException $e) {
            $status = $e->getCode() ?: 400;
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], $status);
        }
    }
}
