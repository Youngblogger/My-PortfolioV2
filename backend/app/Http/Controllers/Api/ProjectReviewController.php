<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectReview;
use App\Models\ServiceOrder;
use App\Models\Milestone;
use App\Models\ServiceActivityLog;
use App\Models\Notification;
use App\Models\User;
use App\Services\MilestoneService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProjectReviewController extends Controller
{
    public function __construct(
        private MilestoneService $milestoneService,
    ) {}

    public function milestoneApprove(Request $request, string $orderId, string $milestoneId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $milestone = Milestone::where('service_order_id', $orderId)->findOrFail($milestoneId);

        if ($milestone->review_status !== 'pending') {
            return response()->json(['success' => false, 'error' => 'No review pending for this milestone.'], 422);
        }

        DB::beginTransaction();
        try {
            $milestone->update([
                'review_status' => 'approved',
                'review_feedback' => null,
            ]);

            ServiceActivityLog::create([
                'service_order_id' => $order->id,
                'user_id' => $request->user()->id,
                'action' => 'milestone_review_approved',
                'description' => "Client approved milestone: \"{$milestone->title}\".",
                'metadata' => ['milestone_id' => $milestone->id, 'milestone_title' => $milestone->title],
            ]);

            // Check if this is the final milestone -> auto-complete project
            $lastMs = $order->milestones()->orderBy('sort_order', 'desc')->first();
            if ($lastMs && $lastMs->id === $milestone->id && $milestone->status === 'completed') {
                $order->update([
                    'project_status' => 'completed',
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);

                ServiceActivityLog::create([
                    'service_order_id' => $order->id,
                    'user_id' => $request->user()->id,
                    'action' => 'project_completed',
                    'description' => 'Project completed automatically after final milestone approval.',
                ]);

                Notification::create([
                    'user_id' => $order->user_id,
                    'service_order_id' => $order->id,
                    'type' => 'project_completed',
                    'title' => 'Project Completed!',
                    'body' => 'Congratulations! Your project has been completed. Please leave a review.',
                    'action_url' => "/hire/project/{$order->id}",
                    'action_text' => 'View Project',
                    'channel' => 'in_app',
                ]);
            }

            $admins = User::whereHas('profile', fn ($q) => $q->where('role', 'admin'))->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'service_order_id' => $order->id,
                    'type' => 'milestone_review_approved',
                    'title' => 'Milestone Approved by Client',
                    'body' => "Client approved milestone: \"{$milestone->title}\".",
                    'action_url' => "/admin/projects/{$order->id}",
                    'action_text' => 'View Project',
                    'channel' => 'in_app',
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'review_status' => 'approved',
                    'project_status' => $order->fresh()->project_status,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function milestoneRequestChanges(Request $request, string $orderId, string $milestoneId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'feedback' => ['required', 'string', 'max:5000'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $milestone = Milestone::where('service_order_id', $orderId)->findOrFail($milestoneId);

        if ($milestone->review_status !== 'pending') {
            return response()->json(['success' => false, 'error' => 'No review pending for this milestone.'], 422);
        }

        DB::beginTransaction();
        try {
            $milestone->update([
                'review_status' => 'changes_requested',
                'review_feedback' => $request->feedback,
                'status' => 'in_progress',
                'completed_at' => null,
            ]);

            // If project was auto-completed, revert to in_progress
            if ($order->project_status === 'completed') {
                $order->update([
                    'project_status' => 'in_progress',
                    'completed_at' => null,
                ]);
            }

            ServiceActivityLog::create([
                'service_order_id' => $order->id,
                'user_id' => $request->user()->id,
                'action' => 'milestone_review_changes_requested',
                'description' => "Client requested changes for milestone: \"{$milestone->title}\".",
                'metadata' => [
                    'milestone_id' => $milestone->id,
                    'milestone_title' => $milestone->title,
                    'feedback' => $request->feedback,
                ],
            ]);

            $admins = User::whereHas('profile', fn ($q) => $q->where('role', 'admin'))->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'service_order_id' => $order->id,
                    'type' => 'milestone_changes_requested',
                    'title' => 'Changes Requested by Client',
                    'body' => "Client requested changes for milestone \"{$milestone->title}\": {$request->feedback}",
                    'action_url' => "/admin/projects/{$order->id}",
                    'action_text' => 'View Feedback',
                    'channel' => 'in_app',
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => ['review_status' => 'changes_requested'],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function requestReview(Request $request, string $milestoneId)
    {
        if (!$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $milestone = Milestone::with('serviceOrder')->findOrFail($milestoneId);

        if ($milestone->status !== 'completed') {
            return response()->json(['success' => false, 'error' => 'Milestone must be completed before requesting review.'], 422);
        }

        $milestone->update([
            'review_requested_at' => now(),
            'review_status' => 'pending',
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $milestone->service_order_id,
            'user_id' => $request->user()->id,
            'action' => 'milestone_review_requested',
            'description' => "Review requested for milestone: \"{$milestone->title}\".",
            'metadata' => ['milestone_id' => $milestone->id, 'milestone_title' => $milestone->title],
        ]);

        Notification::create([
            'user_id' => $milestone->serviceOrder->user_id,
            'service_order_id' => $milestone->service_order_id,
            'type' => 'milestone_review_requested',
            'title' => 'Project Ready for Review',
            'body' => "The \"{$milestone->title}\" milestone is ready for your review. Please approve or request changes.",
            'action_url' => "/hire/project/{$milestone->service_order_id}",
            'action_text' => 'Review Now',
            'channel' => 'in_app',
        ]);

        return response()->json([
            'success' => true,
            'data' => ['review_status' => 'pending', 'review_requested_at' => now()],
        ]);
    }

    public function submit(Request $request, string $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        if ($order->project_status !== 'completed') {
            return response()->json(['success' => false, 'error' => 'Project must be completed before submitting a review.'], 422);
        }

        $existing = ProjectReview::where('service_order_id', $orderId)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'error' => 'You have already submitted a review for this project.'], 422);
        }

        $validator = Validator::make($request->all(), [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'review' => ['nullable', 'string', 'max:5000'],
            'allow_showcase' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $review = ProjectReview::create([
            'service_order_id' => $order->id,
            'user_id' => $request->user()->id,
            'rating' => $request->rating,
            'review' => $request->review,
            'is_visible' => $request->boolean('allow_showcase', true),
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $request->user()->id,
            'action' => 'review_submitted',
            'description' => "Client submitted a {$request->rating}-star review.",
            'metadata' => ['rating' => $request->rating],
        ]);

        $admins = User::whereHas('profile', fn ($q) => $q->where('role', 'admin'))->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'service_order_id' => $order->id,
                'type' => 'review_submitted',
                'title' => 'New Project Review',
                'body' => "Client submitted a {$request->rating}-star review for project {$order->project_number}.",
                'action_url' => "/admin/projects/{$order->id}",
                'action_text' => 'View Review',
                'channel' => 'in_app',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $review->id,
                'rating' => $review->rating,
                'review' => $review->review,
                'is_visible' => $review->is_visible,
                'is_featured' => $review->is_featured,
            ],
        ], 201);
    }

    public function show(Request $request, string $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $review = ProjectReview::where('service_order_id', $orderId)
            ->with('user.profile')
            ->first();

        if (!$review) {
            return response()->json(['success' => false, 'error' => 'No review found for this project.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $review->id,
                'rating' => $review->rating,
                'review' => $review->review,
                'is_visible' => $review->is_visible,
                'is_featured' => $review->is_featured,
                'created_at' => $review->created_at,
                'user' => $review->user?->profile ? [
                    'full_name' => $review->user->profile->full_name,
                ] : null,
            ],
        ]);
    }

    // ─── Admin Review Management ─────────────────────────────────────

    public function adminList(Request $request)
    {
        if (!$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $reviews = ProjectReview::with(['user.profile', 'serviceOrder'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $reviews]);
    }

    public function moderate(Request $request, string $reviewId)
    {
        if (!$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'is_visible' => ['required', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $review = ProjectReview::findOrFail($reviewId);
        $review->update([
            'is_visible' => $request->is_visible,
            'is_featured' => $request->boolean('is_featured', $review->is_featured),
            'moderated_at' => now(),
        ]);

        return response()->json(['success' => true, 'data' => $review]);
    }
}
