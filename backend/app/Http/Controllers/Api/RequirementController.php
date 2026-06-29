<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RequirementQuestion;
use App\Models\RequirementResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RequirementController extends Controller
{
    public function questions(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_id' => ['nullable', 'string', 'exists:services,id'],
            'project_type_id' => ['nullable', 'string', 'exists:project_types,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $query = RequirementQuestion::where('is_active', true)->orderBy('sort_order');

        if ($request->service_id) {
            $query->where(function ($q) use ($request) {
                $q->where('service_id', $request->service_id)
                  ->orWhereNull('service_id');
            });
        }

        if ($request->project_type_id) {
            $query->where(function ($q) use ($request) {
                $q->where('project_type_id', $request->project_type_id)
                  ->orWhereNull('project_type_id');
            });
        }

        $questions = $query->get()->map(fn ($q) => [
            'id' => $q->id,
            'question_key' => $q->question_key,
            'question' => $q->question,
            'description' => $q->description,
            'type' => $q->type,
            'options' => $q->options,
            'is_required' => $q->is_required,
        ]);

        return response()->json([
            'success' => true,
            'data' => $questions,
        ]);
    }

    public function saveResponses(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_order_id' => ['required', 'string', 'exists:service_orders,id'],
            'responses' => ['required', 'array'],
            'responses.*' => ['required'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $order = \App\Models\ServiceOrder::findOrFail($request->service_order_id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $response = RequirementResponse::updateOrCreate(
            ['service_order_id' => $request->service_order_id],
            [
                'user_id' => $request->user()->id,
                'responses' => $request->responses,
                'metadata' => $request->metadata,
            ]
        );

        $order->update(['metadata' => array_merge($order->metadata ?? [], [
            'requirements' => $request->responses,
        ])]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $response->id,
                'responses' => $response->responses,
            ],
        ]);
    }

    public function getResponses(Request $request, $orderId)
    {
        $order = \App\Models\ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $response = RequirementResponse::where('service_order_id', $orderId)->first();

        return response()->json([
            'success' => true,
            'data' => $response ? $response->responses : [],
        ]);
    }
}
