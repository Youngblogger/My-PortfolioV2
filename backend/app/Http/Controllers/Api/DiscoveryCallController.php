<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreateDiscoveryCallRequest;
use App\Models\DiscoveryCall;
use Illuminate\Http\Request;

class DiscoveryCallController extends Controller
{
    public function store(CreateDiscoveryCallRequest $request)
    {
        $call = DiscoveryCall::create([
            'user_id' => $request->user()->id,
            'service_order_id' => $request->service_order_id,
            'status' => 'pending',
            'preferred_date' => $request->preferred_date,
            'preferred_time' => $request->preferred_time,
            'timezone' => $request->timezone ?? 'Africa/Lagos',
            'meeting_type' => $request->meeting_type,
            'project_summary' => $request->project_summary,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $call->id,
                'status' => 'pending',
            ],
        ]);
    }

    public function myCalls(Request $request)
    {
        $calls = DiscoveryCall::where('user_id', $request->user()->id)
            ->orderBy('preferred_date', 'desc')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'preferred_date' => $c->preferred_date,
                'preferred_time' => $c->preferred_time,
                'meeting_type' => $c->meeting_type,
                'meeting_link' => $c->meeting_link,
                'status' => $c->status,
                'created_at' => $c->created_at,
            ]);

        return response()->json(['success' => true, 'data' => $calls]);
    }
}
