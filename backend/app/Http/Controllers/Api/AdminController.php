<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateServiceRequest;
use App\Http\Requests\Api\UpdateProjectRequest;
use App\Http\Requests\Api\ChangeProjectStatusRequest;
use App\Http\Requests\Api\MilestoneActionRequest;
use App\Http\Requests\Api\StoreNoteRequest;
use App\Models\ServiceOrder;
use App\Models\Service;
use App\Models\ProjectType;
use App\Models\Package;
use App\Models\AddOn;
use App\Models\TeamMember;
use App\Models\TeamAssignment;
use App\Models\DiscoveryCall;
use App\Models\Proposal;
use App\Models\ServiceActivityLog;
use App\Models\Notification;
use App\Models\RequirementQuestion;
use App\Models\Milestone;
use App\Services\MilestoneService;
use App\Services\ProjectManagementService;
use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    private ProjectManagementService $projectService;
    private MilestoneService $milestoneService;
    private FileService $fileService;

    public function __construct()
    {
        $this->projectService = new ProjectManagementService();
        $this->milestoneService = new MilestoneService();
        $this->fileService = new FileService();
    }
    public function dashboard()
    {
        $stats = [
            'total_orders' => ServiceOrder::count(),
            'active_projects' => ServiceOrder::whereIn('status', ['development', 'testing'])->count(),
            'pending_proposals' => Proposal::where('status', 'draft')->count(),
            'pending_calls' => DiscoveryCall::where('status', 'pending')->count(),
            'revenue_ngn' => (float) ServiceOrder::where('payment_status', 'paid')->sum('total_ngn'),
            'leads' => ServiceOrder::where('status', 'lead')->count(),
        ];

        $ordersByStatus = ServiceOrder::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $recentOrders = ServiceOrder::with(['service', 'projectType', 'user.profile'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'service' => $o->service?->title,
                'project' => $o->projectType?->title,
                'status' => $o->status,
                'payment_status' => $o->payment_status,
                'total_ngn' => (float) $o->total_ngn,
                'client' => $o->user?->profile?->full_name ?? 'Unknown',
                'created_at' => $o->created_at,
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'orders_by_status' => $ordersByStatus,
                'recent_orders' => $recentOrders,
            ],
        ]);
    }

    public function orders(Request $request)
    {
        $query = ServiceOrder::with(['service', 'projectType', 'package', 'user.profile']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->search}%")
                  ->orWhereHas('user.profile', fn ($p) => $p->where('full_name', 'like', "%{$request->search}%"));
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', 'string', 'in:lead,discovery,proposal,approved,development,testing,deployment,completed'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $order = ServiceOrder::findOrFail($id);
        $oldStatus = $order->status;
        $order->update(['status' => $request->status]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $request->user()->id,
            'action' => 'status_changed',
            'description' => "Status changed from {$oldStatus} to {$request->status}.",
        ]);

        Notification::create([
            'user_id' => $order->user_id,
            'service_order_id' => $order->id,
            'type' => 'status_changed',
            'title' => 'Project Status Updated',
            'body' => "Your project status changed to {$request->status}.",
            'action_url' => "/hire/project/{$order->id}",
            'action_text' => 'View Project',
            'channel' => 'in_app',
        ]);

        return response()->json(['success' => true, 'data' => ['status' => $request->status]]);
    }

    public function reviewRequirements(Request $request, $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        $order->update([
            'project_status' => 'requirements_reviewed',
            'requirements_reviewed_at' => now(),
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $request->user()->id,
            'action' => 'requirements_reviewed',
            'description' => 'Project requirements reviewed and approved.',
        ]);

        Notification::create([
            'user_id' => $order->user_id,
            'service_order_id' => $order->id,
            'type' => 'requirements_reviewed',
            'title' => 'Requirements Approved',
            'body' => 'Your project requirements have been reviewed and approved. Team assignment is next.',
            'action_url' => '/hire/project/' . $order->id,
            'action_text' => 'View Project',
            'channel' => 'in_app',
        ]);

        return response()->json(['success' => true, 'data' => ['project_status' => 'requirements_reviewed']]);
    }

    public function kickoffProject(Request $request, $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        $order->update([
            'project_status' => 'in_progress',
            'status' => 'in_progress',
            'kickoff_at' => now(),
        ]);

        // Mark kickoff milestone as completed
        $order->milestones()
            ->where('milestone_type', 'kickoff')
            ->update(['status' => 'completed', 'completed_at' => now()]);

        // Mark team assignment milestone as completed
        $order->milestones()
            ->where('milestone_type', 'team')
            ->update(['status' => 'completed', 'completed_at' => now()]);

        // Mark requirements review milestone as completed
        $order->milestones()
            ->where('milestone_type', 'planning')
            ->update(['status' => 'completed', 'completed_at' => now()]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $request->user()->id,
            'action' => 'project_kickoff',
            'description' => 'Project kickoff completed. Development phase initiated.',
        ]);

        Notification::create([
            'user_id' => $order->user_id,
            'service_order_id' => $order->id,
            'type' => 'project_kickoff',
            'title' => 'Project is Live!',
            'body' => 'Your project has kicked off! The team is now working on design and development.',
            'action_url' => '/hire/project/' . $order->id,
            'action_text' => 'View Project',
            'channel' => 'in_app',
        ]);

        return response()->json(['success' => true, 'data' => ['project_status' => 'in_progress']]);
    }

    public function updateMilestone(Request $request, $milestoneId)
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', 'string', 'in:pending,in_progress,completed'],
            'completion_notes' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $milestone = Milestone::with('serviceOrder')->findOrFail($milestoneId);

        $oldStatus = $milestone->status;
        $milestone->update([
            'status' => $request->status,
            'completed_at' => $request->status === 'completed' ? now() : ($request->status === 'pending' ? null : $milestone->completed_at),
            'completion_notes' => $request->completion_notes ?? $milestone->completion_notes,
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $milestone->service_order_id,
            'user_id' => $request->user()->id,
            'action' => 'milestone_' . $request->status,
            'description' => 'Milestone "' . $milestone->title . '" changed from ' . $oldStatus . ' to ' . $request->status . '.',
            'metadata' => ['milestone_id' => $milestone->id, 'milestone_title' => $milestone->title],
        ]);

        if ($request->status === 'completed') {
            Notification::create([
                'user_id' => $milestone->serviceOrder->user_id,
                'service_order_id' => $milestone->service_order_id,
                'type' => 'milestone_completed',
                'title' => 'Milestone Completed: ' . $milestone->title,
                'body' => 'The "' . $milestone->title . '" milestone has been completed.',
                'action_url' => '/hire/project/' . $milestone->service_order_id,
                'action_text' => 'View Progress',
                'channel' => 'in_app',
            ]);
        }

        return response()->json(['success' => true, 'data' => $milestone]);
    }

    public function assignTeam(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'team_member_id' => ['required', 'string', 'exists:team_members,id'],
            'role' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $assignment = TeamAssignment::create([
            'service_order_id' => $orderId,
            'team_member_id' => $request->team_member_id,
            'role' => $request->role,
        ]);

        $member = TeamMember::with('user.profile')->find($request->team_member_id);
        $order = ServiceOrder::find($orderId);

        Notification::create([
            'user_id' => $order->user_id,
            'service_order_id' => $orderId,
            'type' => 'team_assigned',
            'title' => 'Team Member Assigned',
            'body' => "{$member?->user?->profile?->full_name} has been assigned as {$request->role}.",
            'channel' => 'in_app',
        ]);

        return response()->json(['success' => true, 'data' => $assignment]);
    }

    public function unassignTeam(Request $request, $assignmentId)
    {
        $assignment = TeamAssignment::findOrFail($assignmentId);
        $assignment->update(['status' => 'removed', 'unassigned_at' => now()]);

        return response()->json(['success' => true]);
    }

    // CMS - Services
    public function createService(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:services,slug'],
            'icon' => ['required', 'string'],
            'short_description' => ['required', 'string'],
            'starting_price_ngn' => ['required', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $service = Service::create($request->all());
        return response()->json(['success' => true, 'data' => $service]);
    }

    public function updateService(UpdateServiceRequest $request, $id)
    {
        $service = Service::findOrFail($id);
        $service->update($request->all());
        return response()->json(['success' => true, 'data' => $service]);
    }

    public function createProjectType(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_id' => ['required', 'string', 'exists:services,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:project_types,slug'],
            'starting_price_ngn' => ['required', 'numeric', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $pt = ProjectType::create($request->all());
        return response()->json(['success' => true, 'data' => $pt]);
    }

    public function createPackage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_type_id' => ['required', 'string', 'exists:project_types,id'],
            'name' => ['required', 'string', 'max:255'],
            'price_ngn' => ['required', 'numeric', 'min:0'],
            'features' => ['nullable', 'array'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $pkg = Package::create($request->all());
        return response()->json(['success' => true, 'data' => $pkg]);
    }

    public function createAddOn(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:add_ons,slug'],
            'price_ngn' => ['required', 'numeric', 'min:0'],
            'category' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $addOn = AddOn::create($request->all());
        return response()->json(['success' => true, 'data' => $addOn]);
    }

    // Team Management
    public function teamMembers()
    {
        $members = TeamMember::with('user.profile')->get()->map(fn ($m) => [
            'id' => $m->id,
            'name' => $m->user?->profile?->full_name ?? $m->user?->email,
            'email' => $m->user?->email,
            'title' => $m->title,
            'role_slug' => $m->role_slug,
            'avatar_url' => $m->avatar_url,
            'is_available' => $m->is_available,
        ]);

        return response()->json(['success' => true, 'data' => $members]);
    }

    public function createTeamMember(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => ['required', 'string', 'exists:users,id'],
            'role_slug' => ['required', 'string'],
            'title' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $member = TeamMember::create($request->all());
        return response()->json(['success' => true, 'data' => $member]);
    }

    // Management
    public function manageDiscoveryCalls()
    {
        $calls = DiscoveryCall::with('user.profile', 'serviceOrder')
            ->orderBy('preferred_date')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'client' => $c->user?->profile?->full_name ?? 'Unknown',
                'email' => $c->user?->email,
                'preferred_date' => $c->preferred_date,
                'preferred_time' => $c->preferred_time,
                'meeting_type' => $c->meeting_type,
                'status' => $c->status,
                'project_summary' => $c->project_summary,
            ]);

        return response()->json(['success' => true, 'data' => $calls]);
    }

    public function updateDiscoveryCall(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', 'string', 'in:approved,rescheduled,cancelled,completed'],
            'meeting_link' => ['nullable', 'url'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $call = DiscoveryCall::findOrFail($id);
        $data = $request->only(['status', 'meeting_link', 'admin_notes']);

        if ($request->status === 'approved') {
            $data['scheduled_at'] = now();
        } elseif ($request->status === 'completed') {
            $data['completed_at'] = now();
        } elseif ($request->status === 'cancelled') {
            $data['cancelled_at'] = now();
        }

        $call->update($data);

        return response()->json(['success' => true, 'data' => $call]);
    }

    public function requirementQuestions()
    {
        $questions = RequirementQuestion::with('service', 'projectType')
            ->orderBy('sort_order')
            ->get();

        return response()->json(['success' => true, 'data' => $questions]);
    }

    public function createRequirementQuestion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'question_key' => ['required', 'string', 'unique:requirement_questions,question_key'],
            'question' => ['required', 'string'],
            'type' => ['required', 'string', 'in:text,textarea,select,boolean,multi_select'],
            'options' => ['nullable', 'array'],
            'service_id' => ['nullable', 'string', 'exists:services,id'],
            'project_type_id' => ['nullable', 'string', 'exists:project_types,id'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $q = RequirementQuestion::create($request->all());
        return response()->json(['success' => true, 'data' => $q]);
    }

    // ─── Project Workspace Endpoints ─────────────────────────────────

    public function projects(Request $request)
    {
        $projects = $this->projectService->listProjects($request);
        return response()->json(['success' => true, 'data' => $projects]);
    }

    public function projectShow(string $id)
    {
        $project = $this->projectService->getProjectDetails($id);
        $progress = $this->projectService->calculateProgress($project);
        $metadata = $project->metadata ?? [];

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $project->id,
                'order_number' => $project->order_number,
                'project_number' => $project->project_number,
                'project_name' => $metadata['project_name'] ?? $project->projectType?->title,
                'status' => $project->status,
                'project_status' => $project->project_status,
                'payment_status' => $project->payment_status,
                'priority' => $metadata['priority'] ?? 'normal',
                'total_ngn' => (float) $project->total_ngn,
                'amount_paid_ngn' => (float) $project->payments()->whereIn('status', ['success', 'completed'])->sum('amount_ngn'),
                'balance_ngn' => (float) ($project->total_ngn - $project->payments()->whereIn('status', ['success', 'completed'])->sum('amount_ngn')),
                'created_at' => $project->created_at,
                'project_created_at' => $project->project_created_at,
                'kickoff_at' => $project->kickoff_at,
                'completed_at' => $project->completed_at,
                'estimated_completion' => $project->estimated_completion,
                'notes' => $project->notes,
                'client' => $project->user?->profile ? [
                    'id' => $project->user->id,
                    'full_name' => $project->user->profile->full_name,
                    'email' => $project->user->email,
                    'phone' => $project->user->profile->phone,
                    'avatar_url' => $project->user->profile->avatar_url,
                    'company' => $project->user->profile->company,
                ] : null,
                'service' => $project->service ? [
                    'id' => $project->service->id,
                    'title' => $project->service->title,
                    'slug' => $project->service->slug,
                ] : null,
                'projectType' => $project->projectType ? [
                    'id' => $project->projectType->id,
                    'title' => $project->projectType->title,
                ] : null,
                'package' => $project->package ? [
                    'id' => $project->package->id,
                    'name' => $project->package->name,
                ] : null,
                'addOns' => $project->addOns->map(fn ($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'price_ngn' => (float) $a->price_ngn,
                ]),
                'milestones' => $project->milestones->map(fn ($m) => [
                    'id' => $m->id,
                    'title' => $m->title,
                    'description' => $m->description,
                    'milestone_type' => $m->milestone_type,
                    'status' => $m->status,
                    'sort_order' => $m->sort_order,
                    'due_date' => $m->due_date?->toIso8601String(),
                    'completed_at' => $m->completed_at?->toIso8601String(),
                    'deliverables' => $m->deliverables,
                    'completion_notes' => $m->completion_notes,
                ]),
                'progress' => $progress,
                'invoices' => $project->invoices->map(fn ($i) => [
                    'id' => $i->id,
                    'invoice_number' => $i->invoice_number,
                    'status' => $i->status,
                    'total_ngn' => (float) $i->total_ngn,
                    'amount_paid_ngn' => (float) $i->amount_paid_ngn,
                    'balance_ngn' => (float) $i->balance_ngn,
                    'payment_type' => $i->payment_type,
                    'paid_at' => $i->paid_at?->toIso8601String(),
                    'created_at' => $i->created_at,
                ]),
                'payments' => $project->payments->map(fn ($p) => [
                    'id' => $p->id,
                    'reference' => $p->reference,
                    'gateway' => $p->gateway,
                    'amount_ngn' => (float) $p->amount_ngn,
                    'status' => $p->status,
                    'payment_type' => $p->payment_type,
                    'paid_at' => $p->paid_at?->toIso8601String(),
                    'created_at' => $p->created_at,
                ]),
                'receipts' => $project->receipts->map(fn ($r) => [
                    'id' => $r->id,
                    'receipt_number' => $r->receipt_number,
                    'amount_ngn' => (float) $r->amount_ngn,
                    'currency' => $r->currency,
                    'payment_gateway' => $r->payment_gateway,
                    'status' => $r->status,
                    'created_at' => $r->created_at,
                ]),
                'activityLogs' => $project->activityLogs->map(fn ($l) => [
                    'id' => $l->id,
                    'action' => $l->action,
                    'description' => $l->description,
                    'metadata' => $l->metadata,
                    'created_at' => $l->created_at,
                    'user' => $l->user?->profile ? [
                        'full_name' => $l->user->profile->full_name,
                    ] : null,
                ]),
                'projectManager' => $project->projectManager?->profile ? [
                    'full_name' => $project->projectManager->profile->full_name,
                ] : null,
                'internalNotes' => $project->internalNotes->map(fn ($n) => [
                    'id' => $n->id,
                    'content' => $n->content,
                    'edit_history' => $n->edit_history,
                    'created_at' => $n->created_at,
                    'updated_at' => $n->updated_at,
                    'user' => $n->user?->profile ? [
                        'full_name' => $n->user->profile->full_name,
                    ] : null,
                ]),
                'team_assignments' => [], // placeholder for future
            ],
        ]);
    }

    public function projectUpdate(UpdateProjectRequest $request, string $id)
    {
        try {
            $project = $this->projectService->updateProject($id, $request->validated());
            return response()->json(['success' => true, 'data' => ['project_status' => $project->project_status]]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function projectChangeStatus(ChangeProjectStatusRequest $request, string $id)
    {
        try {
            $project = $this->projectService->changeStatus($id, $request->status, $request->reason);
            return response()->json(['success' => true, 'data' => ['project_status' => $project->project_status]]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 422);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function milestoneAction(MilestoneActionRequest $request, string $milestoneId, string $action)
    {
        $validActions = ['start', 'complete', 'reopen', 'delay', 'cancel', 'block'];
        if (!in_array($action, $validActions)) {
            return response()->json(['success' => false, 'error' => "Invalid action: {$action}"], 422);
        }

        try {
            $milestone = Milestone::with('serviceOrder')->findOrFail($milestoneId);
            $milestone = $this->milestoneService->transition($milestone, $action, $request->notes);
            return response()->json(['success' => true, 'data' => $milestone]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 422);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    // ─── Internal Notes ──────────────────────────────────────────────

    public function listNotes(string $projectId)
    {
        $project = ServiceOrder::findOrFail($projectId);
        $notes = $project->internalNotes()->with('user.profile')->orderBy('created_at', 'desc')->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'content' => $n->content,
                'edit_history' => $n->edit_history,
                'created_at' => $n->created_at,
                'updated_at' => $n->updated_at,
                'user' => $n->user?->profile ? [
                    'full_name' => $n->user->profile->full_name,
                ] : null,
            ]);
        return response()->json(['success' => true, 'data' => $notes]);
    }

    public function createNote(StoreNoteRequest $request, string $projectId)
    {
        $serviceOrder = ServiceOrder::findOrFail($projectId);
        $note = $this->projectService->addNote($projectId, $request->content);
        return response()->json(['success' => true, 'data' => $note], 201);
    }

    public function updateNote(StoreNoteRequest $request, string $noteId)
    {
        $note = $this->projectService->updateNote($noteId, $request->content);
        return response()->json(['success' => true, 'data' => $note]);
    }

    public function deleteNote(string $noteId)
    {
        $this->projectService->deleteNote($noteId);
        return response()->json(['success' => true]);
    }

    // ─── Delivery Items ─────────────────────────────────────────────

    public function addDeliveryItem(Request $request, string $id)
    {
        $order = ServiceOrder::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:file,url,text,credentials'],
            'description' => ['nullable', 'string', 'max:5000'],
            'file' => ['nullable', 'file', 'max:102400'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        if ($request->type === 'file' && !$request->hasFile('file')) {
            return response()->json(['success' => false, 'error' => 'File is required for type "file".'], 422);
        }

        try {
            $item = $this->fileService->storeDeliveryItem(
                $order,
                $request->name,
                $request->type,
                $request->description,
                $request->file('file')
            );

            return response()->json(['success' => true, 'data' => $item], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function removeDeliveryItem(Request $request, string $id, string $fileId)
    {
        $file = \App\Models\ServiceFile::where('service_order_id', $id)
            ->where('category', 'delivery')
            ->findOrFail($fileId);

        try {
            $this->fileService->deleteFile($file);
            return response()->json(['success' => true]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    // ─── Activity ────────────────────────────────────────────────────

    public function projectActivity(string $id)
    {
        $project = ServiceOrder::findOrFail($id);
        $logs = ServiceActivityLog::with('user.profile')
            ->where('service_order_id', $id)
            ->orderBy('created_at', 'desc')
            ->paginate(50);
        return response()->json(['success' => true, 'data' => $logs]);
    }
}
