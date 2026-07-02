<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceMessage;
use App\Models\ServiceOrder;
use App\Models\ServiceActivityLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectMessageController extends Controller
{
    public function index(Request $request, string $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $currentUserId = $request->user()->id;
        $since = $request->query('since');

        $query = ServiceMessage::with('user.profile')
            ->where('service_order_id', $orderId);

        if ($since) {
            $query->where('created_at', '>', $since);
        }

        $messages = $query->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($m) => $this->formatMessage($m, $currentUserId));

        if ($since) {
            // Polling — mark as delivered only
            ServiceMessage::where('service_order_id', $orderId)
                ->where('user_id', '!=', $currentUserId)
                ->whereNull('delivered_at')
                ->update(['delivered_at' => now()]);
        } else {
            // Initial load — mark as delivered and read
            ServiceMessage::where('service_order_id', $orderId)
                ->where('user_id', '!=', $currentUserId)
                ->whereNull('delivered_at')
                ->update(['delivered_at' => now()]);

            ServiceMessage::where('service_order_id', $orderId)
                ->where('user_id', '!=', $currentUserId)
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);
        }

        return response()->json(['success' => true, 'data' => $messages]);
    }

    public function store(Request $request, string $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'message' => ['required', 'string', 'max:10000'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $isAdmin = $request->user()?->profile?->isAdmin();
        $currentUserId = $request->user()->id;

        $message = ServiceMessage::create([
            'service_order_id' => $order->id,
            'user_id' => $currentUserId,
            'message' => $request->message,
            'attachments' => $request->attachments,
            'type' => $request->input('type', 'text'),
        ]);

        $message->load('user.profile');

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $currentUserId,
            'action' => 'discussion_message',
            'description' => ($isAdmin ? 'Admin' : 'Client') . " posted a message in project discussion.",
            'metadata' => ['message_id' => $message->id],
        ]);

        // Notify the other party
        $recipientId = $isAdmin ? $order->user_id : null;
        if (!$recipientId) {
            $admins = User::whereHas('profile', fn ($q) => $q->where('role', 'admin'))->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'service_order_id' => $order->id,
                    'type' => 'new_discussion_message',
                    'title' => 'New Project Message',
                    'body' => $isAdmin
                        ? "A message was posted in project discussion."
                        : "Client posted a message in project discussion.",
                    'action_url' => $isAdmin ? "/admin/projects/{$order->id}" : "/hire/project/{$order->id}",
                    'action_text' => 'View Discussion',
                    'channel' => 'in_app',
                ]);
            }
        } else {
            Notification::create([
                'user_id' => $recipientId,
                'service_order_id' => $order->id,
                'type' => 'new_discussion_message',
                'title' => 'New Project Message',
                'body' => "A new message was posted in your project discussion.",
                'action_url' => "/hire/project/{$order->id}",
                'action_text' => 'View Discussion',
                'channel' => 'in_app',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatMessage($message, $currentUserId),
        ], 201);
    }

    public function markImportant(Request $request, string $messageId)
    {
        if (!$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $message = ServiceMessage::findOrFail($messageId);
        $message->update(['type' => $message->type === 'important' ? 'text' : 'important']);

        return response()->json([
            'success' => true,
            'data' => ['is_important' => $message->type === 'important'],
        ]);
    }

    private function formatMessage($m, string $currentUserId): array
    {
        return [
            'id' => $m->id,
            'message' => $m->message,
            'type' => $m->type,
            'is_important' => $m->type === 'important',
            'attachments' => $m->attachments,
            'is_read' => (bool) $m->is_read,
            'read_at' => $m->read_at?->toIso8601String(),
            'delivered_at' => $m->delivered_at?->toIso8601String(),
            'created_at' => $m->created_at,
            'is_mine' => $m->user_id === $currentUserId,
            'user' => $m->user?->profile ? [
                'id' => $m->user->id,
                'full_name' => $m->user->profile->full_name,
                'avatar_url' => $m->user->profile->avatar_url,
                'is_admin' => $m->user->profile->isAdmin(),
            ] : null,
        ];
    }
}
