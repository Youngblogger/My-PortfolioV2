<?php

namespace App\Services;

use App\Models\Milestone;
use App\Models\ServiceOrder;
use App\Models\ServiceActivityLog;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class MilestoneService
{
    public function transition(Milestone $milestone, string $action, ?string $notes = null): Milestone
    {
        $order = $milestone->serviceOrder;
        $oldStatus = $milestone->status;

        $statusMap = [
            'start' => 'in_progress',
            'complete' => 'completed',
            'reopen' => 'pending',
            'delay' => 'delayed',
            'cancel' => 'cancelled',
            'block' => 'blocked',
        ];

        if (!isset($statusMap[$action])) {
            throw new \InvalidArgumentException("Invalid milestone action: {$action}");
        }

        $newStatus = $statusMap[$action];
        $now = now();

        $milestone->update([
            'status' => $newStatus,
            'completed_at' => $action === 'complete' ? $now : ($action === 'reopen' ? null : $milestone->completed_at),
            'completion_notes' => $notes ?? $milestone->completion_notes,
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => request()->user()->id,
            'action' => 'milestone_' . $newStatus,
            'description' => "Milestone \"{$milestone->title}\" {$newStatus}.",
            'metadata' => [
                'milestone_id' => $milestone->id,
                'milestone_title' => $milestone->title,
                'from_status' => $oldStatus,
                'to_status' => $newStatus,
            ],
        ]);

        if ($action === 'complete') {
            $this->handleMilestoneCompletion($order, $milestone);
        }

        if ($action === 'delay' || $action === 'block') {
            Notification::create([
                'user_id' => $order->user_id,
                'service_order_id' => $order->id,
                'type' => 'milestone_' . $newStatus,
                'title' => "Milestone {$newStatus}: {$milestone->title}",
                'body' => "The \"{$milestone->title}\" milestone has been marked as {$newStatus}.",
                'action_url' => "/hire/project/{$order->id}",
                'action_text' => 'View Progress',
                'channel' => 'in_app',
            ]);
        }

        $milestone->refresh();
        return $milestone;
    }

    private function handleMilestoneCompletion(ServiceOrder $order, Milestone $milestone): void
    {
        Notification::create([
            'user_id' => $order->user_id,
            'service_order_id' => $order->id,
            'type' => 'milestone_completed',
            'title' => "Milestone Completed: {$milestone->title}",
            'body' => "The \"{$milestone->title}\" milestone has been completed.",
            'action_url' => "/hire/project/{$order->id}",
            'action_text' => 'View Progress',
            'channel' => 'in_app',
        ]);

        $lastMs = $order->milestones()->orderBy('sort_order', 'desc')->first();
        if ($lastMs && $lastMs->id === $milestone->id) {
            $order->update([
                'project_status' => 'completed',
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            ServiceActivityLog::create([
                'service_order_id' => $order->id,
                'user_id' => request()->user()->id,
                'action' => 'project_completed',
                'description' => 'Project completed automatically after final milestone.',
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
    }
}
