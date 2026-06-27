<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CouponController extends Controller
{
    public function validate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => ['required', 'string', 'max:50'],
            'course_id' => ['nullable', 'string', 'exists:courses,id'],
            'amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        $coupon = Coupon::where('code', $request->code)
            ->where('is_active', true)
            ->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid or expired coupon code',
            ]);
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            $coupon->update(['is_active' => false]);
            return response()->json([
                'success' => false,
                'error' => 'This coupon has expired',
            ]);
        }

        if ($coupon->max_uses > 0 && $coupon->current_uses >= $coupon->max_uses) {
            return response()->json([
                'success' => false,
                'error' => 'This coupon has reached its usage limit',
            ]);
        }

        if ($request->amount && $coupon->min_purchase > 0 && $request->amount < $coupon->min_purchase) {
            return response()->json([
                'success' => false,
                'error' => 'Minimum purchase amount is ' . number_format($coupon->min_purchase, 2),
            ]);
        }

        if ($request->course_id && $coupon->course_id && $coupon->course_id !== $request->course_id) {
            return response()->json([
                'success' => false,
                'error' => 'This coupon is not applicable to this course',
            ]);
        }

        return response()->json([
            'success' => true,
            'coupon' => [
                'code' => $coupon->code,
                'discount_type' => $coupon->discount_type,
                'discount_value' => $coupon->discount_value,
                'description' => $coupon->description,
            ],
        ]);
    }
}
