<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateServiceRequest;
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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
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
}
