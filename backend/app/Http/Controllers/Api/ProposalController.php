<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreProposalRequest;
use App\Http\Requests\Api\UpdateProposalRequest;
use App\Models\Proposal;
use App\Models\ProposalVersion;
use App\Models\ServiceOrder;
use App\Models\ServiceActivityLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProposalController extends Controller
{
    public function index(Request $request)
    {
        $query = Proposal::with(['service', 'projectType', 'package'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $proposals = $query->get()->map(fn ($p) => [
            'id' => $p->id,
            'proposal_number' => $p->proposal_number,
            'service' => $p->service->title ?? 'Unknown',
            'project' => $p->projectType->title ?? 'Unknown',
            'status' => $p->status,
            'total_ngn' => (float) $p->total_ngn,
            'version' => $p->version,
            'valid_until' => $p->valid_until,
            'created_at' => $p->created_at,
        ]);

        return response()->json(['success' => true, 'data' => $proposals]);
    }

    public function show(Request $request, $id)
    {
        $proposal = Proposal::with([
            'service', 'projectType', 'package', 'versions', 'contract',
            'serviceOrder.milestones', 'serviceOrder.teamAssignments.teamMember.user',
        ])->findOrFail($id);

        if ($proposal->user_id !== $request->user()->id && $request->user()->profile?->role !== 'admin') {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        if (!$proposal->client_viewed_at) {
            $proposal->update(['client_viewed_at' => now()]);
        }

        return response()->json(['success' => true, 'data' => $proposal]);
    }

    public function createFromOrder(StoreProposalRequest $request)
    {
        try {
            DB::beginTransaction();

            $order = ServiceOrder::with(['service', 'projectType', 'package'])->findOrFail($request->service_order_id);

            $proposalNumber = 'PROP-' . strtoupper(substr(uniqid(), -8));

            $proposal = Proposal::create([
                'proposal_number' => $proposalNumber,
                'service_order_id' => $order->id,
                'user_id' => $order->user_id,
                'service_id' => $order->service_id,
                'project_type_id' => $order->project_type_id,
                'package_id' => $order->package_id,
                'status' => 'draft',
                'scope_of_work' => $request->scope_of_work,
                'deliverables' => $request->deliverables,
                'included_features' => $request->included_features ?? $order->package?->features,
                'excluded_items' => $request->excluded_items,
                'timeline_description' => $request->timeline_description,
                'milestones' => $request->milestones,
                'payment_schedule' => $request->payment_schedule,
                'total_ngn' => $request->total_ngn,
                'total_usd' => $request->total_usd ?? 0,
                'terms_and_conditions' => $request->terms_and_conditions,
                'valid_until' => $request->valid_until ?? now()->addDays(14),
                'version' => 1,
            ]);

            ProposalVersion::create([
                'proposal_id' => $proposal->id,
                'version' => 1,
                'changes_description' => 'Initial proposal created.',
                'snapshot' => $proposal->toArray(),
                'created_by' => $request->user()->id,
            ]);

            ServiceActivityLog::create([
                'service_order_id' => $order->id,
                'user_id' => $request->user()->id,
                'action' => 'proposal_created',
                'description' => 'Proposal ' . $proposalNumber . ' created.',
            ]);

            Notification::create([
                'user_id' => $order->user_id,
                'service_order_id' => $order->id,
                'type' => 'proposal_created',
                'title' => 'Proposal Ready',
                'body' => 'Your proposal has been created. Review it now.',
                'action_url' => '/hire/proposals/' . $proposal->id,
                'action_text' => 'View Proposal',
                'channel' => 'in_app',
            ]);

            $order->update(['status' => 'proposal']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $proposal->id,
                    'proposal_number' => $proposalNumber,
                    'status' => 'draft',
                    'total_ngn' => (float) $request->total_ngn,
                ],
            ]);
        } catch (\RuntimeException $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function updateStatus(UpdateProposalRequest $request, $id)
    {
        $proposal = Proposal::findOrFail($id);

        if ($request->status === 'approved') {
            $proposal->update([
                'status' => 'approved',
                'client_approved_at' => now(),
            ]);
        } elseif ($request->status === 'rejected') {
            $proposal->update([
                'status' => 'rejected',
                'client_rejected_at' => now(),
            ]);
        } else {
            $proposal->update(['status' => $request->status]);
        }

        return response()->json([
            'success' => true,
            'data' => ['status' => $proposal->status],
        ]);
    }
}
