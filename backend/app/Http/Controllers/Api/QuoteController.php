<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuoteController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'project_type' => ['required', 'string', 'max:255'],
            'budget_range' => ['required', 'string', 'max:100'],
            'timeline' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        return response()->json([
            'success' => true,
        ]);
    }
}
