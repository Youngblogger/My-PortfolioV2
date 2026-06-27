<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Services\EnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EnrollmentController extends Controller
{
    public function __construct(
        private EnrollmentService $enrollmentService,
    ) {}

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => ['required', 'string', 'exists:courses,id'],
            'tier_id' => ['nullable', 'string', 'exists:pricing_tiers,id'],
            'billing' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        try {
            $enrollment = $this->enrollmentService->createFreeEnrollment(
                $request->user()->id,
                $request->course_id,
                $request->tier_id,
                $request->billing ?? [],
            );

            return response()->json([
                'success' => true,
                'enrollment_id' => $enrollment->id,
                'enrollment' => $enrollment->load('course'),
            ]);
        } catch (\RuntimeException $e) {
            $status = $e->getCode() ?: 400;
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], $status);
        }
    }

    public function show(Request $request)
    {
        $id = $request->query('id');

        if (!$id) {
            return response()->json([
                'success' => false,
                'error' => 'Missing enrollment ID',
            ], 400);
        }

        $enrollment = Enrollment::with(['course', 'transaction', 'invoice'])->find($id);

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'error' => 'Enrollment not found',
            ], 404);
        }

        if ($enrollment->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'enrollment' => $enrollment,
            'course' => $enrollment->course,
            'transaction' => $enrollment->transaction,
            'invoice' => $enrollment->invoice,
        ]);
    }
}
