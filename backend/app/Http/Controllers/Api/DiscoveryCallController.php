<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiscoveryCall;
use Illuminate\Http\Request;

class DiscoveryCallController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'preferred_date' => ['required', 'date', 'after:today'],
            'preferred_time' => ['required', 'date_format:H:i'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'meeting_type' => ['nullable', 'string', 'max:64'],
            'project_summary' => ['nullable', 'string', 'max:5000'],
        ]);

        $call = DiscoveryCall::create([
            'status' => 'pending',
            'preferred_date' => $validated['preferred_date'],
            'preferred_time' => $validated['preferred_time'],
            'timezone' => $validated['timezone'] ?? 'Africa/Lagos',
            'meeting_type' => $validated['meeting_type'] ?? 'google_meet',
            'project_summary' => $validated['project_summary'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $call->id,
                'status' => 'pending',
            ],
        ]);
    }
}
