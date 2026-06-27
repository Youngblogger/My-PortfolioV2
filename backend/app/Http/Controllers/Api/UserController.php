<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    private array $allowedFields = [
        'full_name', 'phone', 'country', 'state', 'city',
        'address', 'company', 'tax_id', 'bio', 'avatar_url',
    ];

    public function show(Request $request)
    {
        $id = $request->query('id');

        if (!$id) {
            return response()->json([
                'success' => false,
                'error' => 'Missing user ID',
            ], 400);
        }

        if ($id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized',
            ], 403);
        }

        $profile = Profile::with('enrollments.course')->findOrFail($id);

        return response()->json([
            'success' => true,
            'profile' => $profile,
            'enrollments' => $profile->enrollments,
        ]);
    }

    public function update(Request $request)
    {
        $updateData = $request->only($this->allowedFields);

        if (empty($updateData)) {
            return response()->json([
                'success' => false,
                'error' => 'No valid fields to update',
            ], 400);
        }

        $validator = Validator::make($updateData, [
            'full_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'company' => ['nullable', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'avatar_url' => ['nullable', 'string', 'url', 'max:500'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        $profile = Profile::findOrFail($request->user()->id);
        $profile->update($updateData);

        return response()->json([
            'success' => true,
            'profile' => $profile->fresh(),
        ]);
    }

    public function dashboard(Request $request)
    {
        $profile = Profile::with('enrollments.course')->findOrFail($request->user()->id);

        return response()->json([
            'success' => true,
            'profile' => $profile,
            'enrollments' => $profile->enrollments,
        ]);
    }
}
