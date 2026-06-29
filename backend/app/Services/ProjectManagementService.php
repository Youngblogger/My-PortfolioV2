<?php

namespace App\Services;

use App\Models\ServiceOrder;
use App\Models\ServiceActivityLog;
use App\Models\Notification;
use App\Models\InternalNote;
use App\Models\Milestone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectManagementService
{
    public function listProjects(Request $request)
    {
        $query = ServiceOrder::with([
            'service', 'projectType', 'package', 'user.profile',
            'milestones' => fn ($q) => $q->orderBy('sort_order'),
        ])->whereIn('payment_status', ['paid', 'partially_paid', 'completed']);

        if ($request->status) {
            $query->where('project_status', $request->status);
        }

        if ($request->priority) {
            $query->where('metadata->priority', $request->priority);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->search}%")
                  ->orWhere('project_number', 'like', "%{$request->search}%")
                  ->orWhereHas('user.profile', fn ($p) => $p->where('full_name', 'like', "%{$request->search}%"))
                  ->orWhereHas('service', fn ($s) => $s->where('title', 'like', "%{$request->search}%"));
            });
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $sortField = $request->sort ?? 'created_at';
        $sortDir = $request->order === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['created_at', 'updated_at', 'order_number', 'project_number'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDir);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = min((int) ($request->per_page ?? 20), 100);
        $projects = $query->paginate($perPage);

        $projects->getCollection()->transform(function ($o) {
            $milestones = $o->milestones ?? collect();
            $total = $milestones->count();
            $completed = $milestones->whereIn('status', ['completed'])->count();
            $progress = $total > 0 ? round(($completed / $total) * 100) : 0;
            $currentMs = $milestones->whereNotIn('status', ['completed', 'cancelled'])->sortBy('sort_order')->first();
            $metadata = $o->metadata ?? [];

            return [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'project_number' => $o->project_number,
                'project_name' => $metadata['project_name'] ?? $o->projectType?->title,
                'client' => $o->user?->profile?->full_name ?? 'Unknown',
                'service' => $o->service?->title,
                'project_type' => $o->projectType?->title,
                'package_name' => $o->package?->name,
                'status' => $o->status,
                'project_status' => $o->project_status,
                'payment_status' => $o->payment_status,
                'priority' => $metadata['priority'] ?? 'normal',
                'current_milestone' => $currentMs?->title,
                'progress' => $progress,
                'total_ngn' => (float) $o->total_ngn,
                'amount_paid_ngn' => (float) ($o->payments()->whereIn('status', ['success', 'completed'])->sum('amount_ngn') ?? 0),
                'created_at' => $o->created_at,
                'updated_at' => $o->updated_at,
                'project_created_at' => $o->project_created_at,
                'kickoff_at' => $o->kickoff_at,
                'completed_at' => $o->completed_at,
            ];
        });

        return $projects;
    }

    public function getProjectDetails(string $id): ServiceOrder
    {
        return ServiceOrder::with([
            'service', 'projectType', 'package',
            'addOns.addOn', 'invoices', 'payments',
            'milestones' => fn ($q) => $q->orderBy('sort_order'),
            'receipts',
            'activityLogs.user.profile' => fn ($q) => $q->orderBy('created_at', 'desc')->limit(50),
            'projectManager.profile',
            'user.profile',
            'internalNotes.user.profile',
        ])->findOrFail($id);
    }

    public function updateProject(string $id, array $data): ServiceOrder
    {
        $order = ServiceOrder::findOrFail($id);
        $allowed = ['priority', 'internal_due_date', 'estimated_completion', 'admin_notes'];
        $updates = [];
        $metadata = $order->metadata ?? [];

        if (isset($data['priority'])) {
            $metadata['priority'] = $data['priority'];
            $updates['metadata'] = $metadata;
        }

        if (isset($data['internal_due_date'])) {
            $updates['metadata'] = array_merge($metadata, ['internal_due_date' => $data['internal_due_date']]);
        }

        if (isset($data['estimated_completion'])) {
            $updates['estimated_completion'] = $data['estimated_completion'];
        }

        if (isset($data['notes'])) {
            $updates['notes'] = $data['notes'];
        }

        if (!empty($updates)) {
            $order->update($updates);

            ServiceActivityLog::create([
                'service_order_id' => $order->id,
                'user_id' => request()->user()->id,
                'action' => 'project_updated',
                'description' => 'Project settings updated.',
                'metadata' => ['changes' => array_keys($updates)],
            ]);
        }

        $order->refresh();
        return $order;
    }

    public function changeStatus(string $id, string $newStatus, ?string $reason = null): ServiceOrder
    {
        $order = ServiceOrder::findOrFail($id);

        $validStatuses = ['draft', 'active', 'on_hold', 'blocked', 'completed', 'cancelled'];
        if (!in_array($newStatus, $validStatuses)) {
            throw new \InvalidArgumentException("Invalid project status: {$newStatus}");
        }

        $oldStatus = $order->project_status;
        $now = now();

        $updates = ['project_status' => $newStatus];

        if ($newStatus === 'completed') {
            $updates['completed_at'] = $now;
        }

        if ($newStatus === 'active' && $oldStatus === 'pending_review') {
            $updates['kickoff_at'] = $now;
        }

        $order->update($updates);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => request()->user()->id,
            'action' => 'project_status_changed',
            'description' => "Project status changed from {$oldStatus} to {$newStatus}." . ($reason ? " Reason: {$reason}" : ''),
            'metadata' => ['from' => $oldStatus, 'to' => $newStatus, 'reason' => $reason],
        ]);

        Notification::create([
            'user_id' => $order->user_id,
            'service_order_id' => $order->id,
            'type' => 'project_status_changed',
            'title' => 'Project Status Updated',
            'body' => "Your project status changed to {$newStatus}." . ($reason ? " Reason: {$reason}" : ''),
            'action_url' => "/hire/project/{$order->id}",
            'action_text' => 'View Project',
            'channel' => 'in_app',
        ]);

        $order->refresh();
        return $order;
    }

    public function addNote(string $orderId, string $content): InternalNote
    {
        $note = InternalNote::create([
            'service_order_id' => $orderId,
            'user_id' => request()->user()->id,
            'content' => $content,
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $orderId,
            'user_id' => request()->user()->id,
            'action' => 'internal_note_added',
            'description' => 'Internal note added.',
        ]);

        return $note->load('user.profile');
    }

    public function updateNote(string $noteId, string $content): InternalNote
    {
        $note = InternalNote::findOrFail($noteId);
        $history = $note->edit_history ?? [];
        $history[] = [
            'content' => $note->content,
            'edited_at' => now()->toIso8601String(),
            'edited_by' => request()->user()->id,
        ];

        $note->update([
            'content' => $content,
            'edit_history' => $history,
        ]);

        return $note->load('user.profile');
    }

    public function deleteNote(string $noteId): void
    {
        $note = InternalNote::findOrFail($noteId);
        $note->delete();
    }

    public function calculateProgress(ServiceOrder $order): array
    {
        $milestones = $order->milestones()->orderBy('sort_order')->get();
        $total = $milestones->count();
        $completed = $milestones->whereIn('status', ['completed'])->count();
        $progress = $total > 0 ? round(($completed / $total) * 100) : 0;
        $current = $milestones->whereNotIn('status', ['completed', 'cancelled'])->sortBy('sort_order')->first();

        return [
            'progress' => $progress,
            'completed' => $completed,
            'total' => $total,
            'current_milestone' => $current?->title,
            'current_milestone_id' => $current?->id,
        ];
    }

    public function getProjectCounts(): array
    {
        $all = ServiceOrder::whereIn('payment_status', ['paid', 'partially_paid', 'completed']);
        return [
            'total' => (clone $all)->count(),
            'active' => (clone $all)->where('project_status', 'in_progress')->count(),
            'pending_review' => (clone $all)->where('project_status', 'pending_review')->count(),
            'on_hold' => (clone $all)->where('project_status', 'on_hold')->count(),
            'completed' => (clone $all)->where('project_status', 'completed')->count(),
            'blocked' => (clone $all)->where('project_status', 'blocked')->count(),
            'cancelled' => (clone $all)->where('project_status', 'cancelled')->count(),
        ];
    }
}
