<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::where('is_published', true)
            ->with(['modules' => function ($q) {
                $q->orderBy('sort_order');
            }, 'pricingTiers' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'courses' => $courses,
        ]);
    }

    public function show(string $slug)
    {
        $course = Course::where('slug', $slug)
            ->where('is_published', true)
            ->with(['modules' => function ($q) {
                $q->orderBy('sort_order');
            }, 'pricingTiers' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }])
            ->first();

        if (!$course) {
            return response()->json([
                'success' => false,
                'error' => 'Course not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'course' => $course,
        ]);
    }

    public function byStack(string $stackId)
    {
        $courses = Course::where('stack_id', $stackId)
            ->where('is_published', true)
            ->with(['pricingTiers' => function ($q) {
                $q->where('is_active', true)->orderBy('sort_order');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'courses' => $courses,
        ]);
    }
}
