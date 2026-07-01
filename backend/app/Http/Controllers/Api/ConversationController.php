<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\ServiceMessage;
use App\Models\ServiceActivityLog;
use App\Models\Notification;
use App\Models\User;
use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    public function __construct(
        private FileService $fileService,
    ) {}

    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $orders = ServiceOrder::with(['service', 'projectType'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        $orderIds = $orders->pluck('id');

        $latestMessages = ServiceMessage::whereIn('service_order_id', $orderIds)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('service_order_id')
            ->map(fn ($msgs) => $msgs->first());

        $unreadCounts = ServiceMessage::whereIn('service_order_id', $orderIds)
            ->where('user_id', '!=', $userId)
            ->where('is_read', false)
            ->groupBy('service_order_id')
            ->select('service_order_id', DB::raw('count(*) as count'))
            ->pluck('count', 'service_order_id');

        $result = $orders->map(function ($order) use ($latestMessages, $unreadCounts) {
            $lastMessage = $latestMessages->get($order->id);
            $metadata = $order->metadata ?? [];

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'project_name' => $metadata['project_name'] ?? $order->projectType?->title ?? 'Project',
                'service' => $order->service?->title,
                'project_type' => $order->projectType?->title,
                'status' => $order->status,
                'project_status' => $order->project_status,
                'last_message' => $lastMessage ? [
                    'id' => $lastMessage->id,
                    'message' => substr($lastMessage->message, 0, 200),
                    'created_at' => $lastMessage->created_at->toIso8601String(),
                    'user_id' => $lastMessage->user_id,
                    'has_attachments' => !empty($lastMessage->attachments),
                ] : null,
                'unread_count' => (int) $unreadCounts->get($order->id, 0),
                'created_at' => $order->created_at->toIso8601String(),
            ];
        });

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function messages(Request $request, string $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $messages = ServiceMessage::with('user.profile')
            ->where('service_order_id', $orderId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($m) => $this->formatMessage($m));

        ServiceMessage::where('service_order_id', $orderId)
            ->where('user_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['success' => true, 'data' => $messages]);
    }

    public function recentMessages(Request $request, string $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $since = $request->query('since');

        $query = ServiceMessage::with('user.profile')
            ->where('service_order_id', $orderId);

        if ($since) {
            $query->where('created_at', '>', $since);
        }

        $messages = $query->orderBy('created_at', 'asc')->get()->map(fn ($m) => $this->formatMessage($m));

        ServiceMessage::where('service_order_id', $orderId)
            ->where('user_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['success' => true, 'data' => $messages]);
    }

    public function storeMessage(Request $request, string $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $isAdmin = $request->user()?->profile?->isAdmin();

        $message = $request->input('message', '');

        $attachmentData = [];

        // Handle file uploads via multipart
        if ($request->hasFile('files')) {
            $files = $request->file('files');
            if (!is_array($files)) {
                $files = [$files];
            }
            foreach ($files as $file) {
                try {
                    $stored = $this->fileService->storeFile(
                        $order,
                        $file,
                        'client_files',
                        null,
                        $isAdmin
                    );
                    $attachmentData[] = [
                        'id' => $stored->id,
                        'name' => $stored->name,
                        'size' => $stored->size,
                        'type' => $stored->type,
                        'category' => $stored->category,
                    ];
                } catch (\RuntimeException $e) {
                    return response()->json(['success' => false, 'error' => 'File upload failed: ' . $e->getMessage()], 400);
                }
            }
        }

        // Also accept pre-existing attachment references
        if ($request->has('attachments') && is_array($request->input('attachments'))) {
            foreach ($request->input('attachments') as $att) {
                if (is_string($att)) {
                    $attachmentData[] = ['url' => $att];
                } elseif (is_array($att)) {
                    $attachmentData[] = $att;
                }
            }
        }

        if (empty(trim($message)) && empty($attachmentData)) {
            return response()->json(['success' => false, 'error' => 'Message or attachment is required.'], 422);
        }

        $record = ServiceMessage::create([
            'service_order_id' => $order->id,
            'user_id' => $request->user()->id,
            'message' => $message,
            'attachments' => !empty($attachmentData) ? $attachmentData : null,
            'type' => $request->input('type', 'text'),
        ]);

        $record->load('user.profile');

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => $request->user()->id,
            'action' => 'discussion_message',
            'description' => ($isAdmin ? 'Admin' : 'Client') . " posted a message in project discussion.",
            'metadata' => ['message_id' => $record->id],
        ]);

        $now = now();
        if ($isAdmin) {
            Notification::create([
                'user_id' => $order->user_id,
                'service_order_id' => $order->id,
                'type' => 'new_discussion_message',
                'title' => 'New Project Message',
                'body' => "A new message was posted in your project discussion.",
                'action_url' => "/hire/project/{$order->id}",
                'action_text' => 'View Discussion',
                'channel' => 'in_app',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } else {
            $adminIds = User::whereHas('profile', fn ($q) => $q->where('role', 'admin'))
                ->pluck('id');
            $notifications = $adminIds->map(fn ($id) => [
                'user_id' => $id,
                'service_order_id' => $order->id,
                'type' => 'new_discussion_message',
                'title' => 'New Project Message',
                'body' => "Client posted a message in project discussion.",
                'action_url' => "/admin/projects/{$order->id}",
                'action_text' => 'View Discussion',
                'channel' => 'in_app',
                'created_at' => $now,
                'updated_at' => $now,
            ])->toArray();
            Notification::insert($notifications);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatMessage($record),
        ], 201);
    }

    public function adminIndex(Request $request)
    {
        $orders = ServiceOrder::with(['service', 'user.profile'])
            ->orderBy('created_at', 'desc')
            ->get();

        $orderIds = $orders->pluck('id');
        $adminId = $request->user()->id;

        $latestMessages = ServiceMessage::whereIn('service_order_id', $orderIds)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('service_order_id')
            ->map(fn ($msgs) => $msgs->first());

        $unreadCounts = ServiceMessage::whereIn('service_order_id', $orderIds)
            ->where('user_id', '!=', $adminId)
            ->where('is_read', false)
            ->groupBy('service_order_id')
            ->select('service_order_id', DB::raw('count(*) as count'))
            ->pluck('count', 'service_order_id');

        $result = $orders->map(function ($order) use ($latestMessages, $unreadCounts) {
            $lastMessage = $latestMessages->get($order->id);
            $metadata = $order->metadata ?? [];
            $clientProfile = $order->user?->profile;

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'project_name' => $metadata['project_name'] ?? $order->projectType?->title ?? 'Project',
                'client_name' => $clientProfile?->full_name ?? 'Client',
                'service' => $order->service?->title,
                'project_status' => $order->project_status,
                'last_message' => $lastMessage ? substr($lastMessage->message, 0, 200) : null,
                'unread_count' => (int) $unreadCounts->get($order->id, 0),
                'created_at' => $order->created_at->toIso8601String(),
            ];
        });

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function unreadCounts(Request $request)
    {
        $userId = $request->user()->id;

        $orderIds = ServiceOrder::where('user_id', $userId)->pluck('id');

        $conversations = ServiceMessage::whereIn('service_order_id', $orderIds)
            ->where('user_id', '!=', $userId)
            ->where('is_read', false)
            ->groupBy('service_order_id')
            ->select('service_order_id', DB::raw('count(*) as unread_count'))
            ->get()
            ->toArray();

        $totalUnread = array_sum(array_column($conversations, 'unread_count'));

        return response()->json([
            'success' => true,
            'data' => [
                'total_unread' => $totalUnread,
                'conversations' => $conversations,
            ],
        ]);
    }

    private function formatMessage($m): array
    {
        return [
            'id' => $m->id,
            'message' => $m->message,
            'type' => $m->type,
            'is_important' => $m->type === 'important',
            'attachments' => $m->attachments,
            'is_read' => (bool) $m->is_read,
            'read_at' => $m->read_at?->toIso8601String(),
            'created_at' => $m->created_at->toIso8601String(),
            'user' => $m->user?->profile ? [
                'id' => $m->user->id,
                'full_name' => $m->user->profile->full_name,
                'avatar_url' => $m->user->profile->avatar_url,
                'is_admin' => $m->user->profile->isAdmin(),
            ] : null,
        ];
    }
}
