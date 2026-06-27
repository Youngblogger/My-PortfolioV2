<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    public function show(Request $request)
    {
        $id = $request->query('id');

        if (!$id) {
            return response()->json([
                'success' => false,
                'error' => 'Missing receipt ID',
            ], 400);
        }

        $receipt = Receipt::find($id);

        if (!$receipt) {
            $receipt = Receipt::where('transaction_reference', $id)->first();
        }

        if (!$receipt) {
            return response()->json([
                'success' => false,
                'error' => 'Receipt not found',
            ], 404);
        }

        if ($receipt->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'receipt' => $receipt,
        ]);
    }
}
