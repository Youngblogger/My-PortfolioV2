<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceOrder;
use App\Models\ServiceFile;
use App\Services\FileService;
use Illuminate\Http\Request;

class UserDownloadsController extends Controller
{
    public function __construct(
        private FileService $fileService,
    ) {}

    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $orders = ServiceOrder::where('user_id', $userId)->pluck('id');

        $files = ServiceFile::with(['serviceOrder.service', 'serviceOrder.projectType', 'user.profile'])
            ->whereIn('service_order_id', $orders)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($f) {
                $order = $f->serviceOrder;
                $metadata = $order?->metadata ?? [];
                return [
                    'id' => $f->id,
                    'name' => $f->name,
                    'type' => $f->type,
                    'size' => $f->size,
                    'category' => $f->category,
                    'description' => $f->description,
                    'created_at' => $f->created_at->toIso8601String(),
                    'order_id' => $f->service_order_id,
                    'order_number' => $order?->order_number,
                    'project_name' => $metadata['project_name'] ?? $order?->projectType?->title ?? 'Project',
                    'service' => $order?->service?->title,
                    'uploaded_by' => $f->user?->profile?->full_name,
                    'is_downloadable' => $order ? $order->canDownloadDelivery() : false,
                    'payment_status' => $order?->payment_status,
                    'project_status' => $order?->project_status,
                ];
            });

        $grouped = $files->groupBy('order_id')->map(function ($items, $orderId) {
            $first = $items->first();
            return [
                'order_id' => $orderId,
                'order_number' => $first['order_number'],
                'project_name' => $first['project_name'],
                'service' => $first['service'],
                'files' => $items->values()->toArray(),
                'total_files' => $items->count(),
                'total_size' => $items->sum('size'),
                'payment_status' => $first['payment_status'],
                'project_status' => $first['project_status'],
                'is_downloadable' => $first['is_downloadable'],
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => [
                'grouped' => $grouped,
                'all_files' => $files->values()->toArray(),
            ],
        ]);
    }

    public function download(Request $request, string $fileId)
    {
        $file = ServiceFile::findOrFail($fileId);
        $order = $file->serviceOrder;

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        if (!$request->user()?->profile?->isAdmin()) {
            if (!$order->isDownloadAllowed()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Project downloads are unavailable. Your project must be fully paid and marked as completed before downloads are enabled.',
                ], 403);
            }
        }

        try {
            $filePath = $this->fileService->getFilePath($file);
            return response()->download($filePath, $file->name);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 404);
        }
    }
}
