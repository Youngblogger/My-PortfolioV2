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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'service' => ['required', 'string', 'max:255'],
            'subService' => ['nullable', 'string', 'max:255'],
            'budget' => ['required', 'string', 'max:100'],
            'project' => ['required', 'string', 'max:10000'],
            'timeline' => ['required', 'string', 'max:255'],
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
