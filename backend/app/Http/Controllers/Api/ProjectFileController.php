<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceFile;
use App\Models\ServiceOrder;
use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectFileController extends Controller
{
    public function __construct(
        private FileService $fileService,
    ) {}

    public function index(Request $request, string $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $category = $request->query('category');
        $sort = $request->query('sort', 'newest');

        $query = $order->files()->with('user.profile');

        if ($category && in_array($category, $this->fileService->getAvailableCategories())) {
            $query->where('category', $category);
        }

        $query->orderBy('created_at', $sort === 'oldest' ? 'asc' : 'desc');

        $files = $query->get()->map(fn ($f) => [
            'id' => $f->id,
            'name' => $f->name,
            'type' => $f->type,
            'size' => $f->size,
            'category' => $f->category,
            'description' => $f->description,
            'is_delivery' => $f->category === 'delivery',
            'created_at' => $f->created_at,
            'user' => $f->user?->profile ? [
                'full_name' => $f->user->profile->full_name,
                'avatar_url' => $f->user->profile->avatar_url,
            ] : null,
        ]);

        return response()->json(['success' => true, 'data' => $files]);
    }

    public function upload(Request $request, string $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'max:102400'],
            'category' => ['nullable', 'string', 'in:client_files,design,development,testing,final_deliverables,other'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $category = $request->input('category', 'other');
        $isClient = !$request->user()?->profile?->isAdmin();

        if ($isClient && !$this->fileService->isCategoryAllowedForClient($category)) {
            return response()->json(['success' => false, 'error' => 'Clients can only upload to the Client Files category.'], 403);
        }

        try {
            $file = $this->fileService->storeFile(
                $order,
                $request->file('file'),
                $category,
                $request->input('description'),
                !$isClient
            );

            return response()->json(['success' => true, 'data' => $file], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function download(Request $request, string $orderId, string $fileId)
    {
        $order = ServiceOrder::findOrFail($orderId);
        $file = ServiceFile::where('service_order_id', $orderId)->findOrFail($fileId);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        try {
            $filePath = $this->fileService->getFilePath($file);

            ServiceActivityLog::create([
                'service_order_id' => $order->id,
                'user_id' => $request->user()->id,
                'action' => 'file_downloaded',
                'description' => ($request->user()->id === $order->user_id ? 'Client' : 'Admin') . " downloaded: {$file->name}",
                'metadata' => ['file_name' => $file->name, 'file_id' => $file->id],
            ]);

            return response()->download($filePath, $file->name);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 404);
        }
    }

    public function destroy(Request $request, string $orderId, string $fileId)
    {
        $order = ServiceOrder::findOrFail($orderId);
        $file = ServiceFile::where('service_order_id', $orderId)->findOrFail($fileId);
        $isAdmin = $request->user()?->profile?->isAdmin();

        if (!$isAdmin) {
            if ($order->user_id !== $request->user()->id) {
                return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
            }
            if ($file->category === 'delivery' || $file->user_id !== $request->user()->id) {
                return response()->json(['success' => false, 'error' => 'Clients can only delete their own non-delivery files.'], 403);
            }
        }

        try {
            $this->fileService->deleteFile($file);
            return response()->json(['success' => true]);
        } catch (\RuntimeException $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function update(Request $request, string $fileId)
    {
        $file = ServiceFile::findOrFail($fileId);
        $order = $file->serviceOrder;

        if (!$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $file = $this->fileService->updateDescription($file, $request->input('description', ''));
        return response()->json(['success' => true, 'data' => $file]);
    }

    public function deliveryIndex(Request $request, string $orderId)
    {
        $order = ServiceOrder::findOrFail($orderId);

        if ($order->user_id !== $request->user()->id && !$request->user()?->profile?->isAdmin()) {
            return response()->json(['success' => false, 'error' => 'Unauthorized.'], 403);
        }

        $items = $order->files()
            ->where('category', 'delivery')
            ->with('user.profile')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'name' => $f->name,
                'type' => $f->type,
                'size' => $f->size,
                'description' => $f->description,
                'has_file' => !empty($f->path) && !empty($f->size) && $f->size > 0,
                'created_at' => $f->created_at,
                'user' => $f->user?->profile ? [
                    'full_name' => $f->user->profile->full_name,
                ] : null,
            ]);

        return response()->json(['success' => true, 'data' => $items]);
    }
}
