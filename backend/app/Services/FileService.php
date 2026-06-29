<?php

namespace App\Services;

use App\Models\ServiceFile;
use App\Models\ServiceOrder;
use App\Models\ServiceActivityLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileService
{
    private const ALLOWED_MIMES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip', 'application/x-zip-compressed',
        'application/x-rar-compressed',
        'text/plain', 'text/csv',
        'application/apk', 'application/octet-stream',
    ];

    private const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

    private const CATEGORIES = [
        'client_files', 'design', 'development', 'testing',
        'final_deliverables', 'other', 'delivery',
    ];

    public function getUploadDisk(): string
    {
        return 'local';
    }

    public function validateFile(UploadedFile $file): void
    {
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \RuntimeException('File exceeds maximum size of 100MB.');
        }
    }

    public function storeFile(
        ServiceOrder $order,
        UploadedFile $file,
        string $category = 'other',
        ?string $description = null,
        bool $isAdmin = false
    ): ServiceFile {
        if (!in_array($category, self::CATEGORIES)) {
            $category = 'other';
        }

        $this->validateFile($file);

        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        $relativePath = "projects/{$order->id}/{$category}/{$filename}";

        Storage::disk($this->getUploadDisk())->put($relativePath, file_get_contents($file->getRealPath()));

        $record = ServiceFile::create([
            'service_order_id' => $order->id,
            'user_id' => request()->user()->id,
            'name' => $file->getClientOriginalName(),
            'path' => $relativePath,
            'type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'category' => $category,
            'description' => $description,
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => request()->user()->id,
            'action' => 'file_uploaded',
            'description' => ($isAdmin ? 'Admin' : 'Client') . " uploaded file: {$file->getClientOriginalName()}",
            'metadata' => [
                'file_id' => $record->id,
                'file_name' => $file->getClientOriginalName(),
                'category' => $category,
                'uploaded_by' => $isAdmin ? 'admin' : 'client',
            ],
        ]);

        $recipientId = $isAdmin ? $order->user_id : null;
        if ($recipientId) {
            Notification::create([
                'user_id' => $recipientId,
                'service_order_id' => $order->id,
                'type' => 'file_uploaded',
                'title' => 'New File Uploaded',
                'body' => "A new file \"{$file->getClientOriginalName()}\" has been uploaded to your project.",
                'action_url' => "/hire/project/{$order->id}",
                'action_text' => 'View Files',
                'channel' => 'in_app',
            ]);
        }

        if (!$isAdmin) {
            $admins = User::whereHas('profile', fn ($q) => $q->where('role', 'admin'))->get();
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'service_order_id' => $order->id,
                    'type' => 'file_uploaded',
                    'title' => 'Client Uploaded File',
                    'body' => "Client uploaded \"{$file->getClientOriginalName()}\".",
                    'action_url' => "/admin/projects/{$order->id}",
                    'action_text' => 'View File',
                    'channel' => 'in_app',
                ]);
            }
        }

        return $record->load('user.profile');
    }

    public function storeDeliveryItem(
        ServiceOrder $order,
        string $name,
        string $type,
        ?string $description = null,
        ?UploadedFile $file = null
    ): ServiceFile {
        $path = null;

        if ($file) {
            $this->validateFile($file);
            $extension = $file->getClientOriginalExtension();
            $filename = Str::uuid() . '.' . $extension;
            $relativePath = "projects/{$order->id}/delivery/{$filename}";
            Storage::disk($this->getUploadDisk())->put($relativePath, file_get_contents($file->getRealPath()));
            $path = $relativePath;
        }

        $record = ServiceFile::create([
            'service_order_id' => $order->id,
            'user_id' => request()->user()->id,
            'name' => $name,
            'path' => $path ?? $description ?? '',
            'type' => $file ? $file->getMimeType() : $type,
            'size' => $file ? $file->getSize() : 0,
            'category' => 'delivery',
            'description' => $description,
        ]);

        ServiceActivityLog::create([
            'service_order_id' => $order->id,
            'user_id' => request()->user()->id,
            'action' => 'delivery_item_added',
            'description' => "Delivery item added: {$name}",
            'metadata' => [
                'delivery_id' => $record->id,
                'item_name' => $name,
                'item_type' => $type,
            ],
        ]);

        Notification::create([
            'user_id' => $order->user_id,
            'service_order_id' => $order->id,
            'type' => 'delivery_available',
            'title' => 'New Delivery Item Available',
            'body' => "A new delivery item \"{$name}\" has been published to your project.",
            'action_url' => "/hire/project/{$order->id}",
            'action_text' => 'View Delivery',
            'channel' => 'in_app',
        ]);

        return $record->load('user.profile');
    }

    public function getFilePath(ServiceFile $file): string
    {
        $disk = Storage::disk($this->getUploadDisk());
        if (!$disk->exists($file->path)) {
            throw new \RuntimeException('File not found on disk.');
        }
        return $disk->path($file->path);
    }

    public function deleteFile(ServiceFile $file): void
    {
        $disk = Storage::disk($this->getUploadDisk());
        if ($disk->exists($file->path)) {
            $disk->delete($file->path);
        }

        $orderId = $file->service_order_id;

        ServiceActivityLog::create([
            'service_order_id' => $orderId,
            'user_id' => request()->user()->id,
            'action' => 'file_deleted',
            'description' => "File deleted: {$file->name}",
            'metadata' => ['file_name' => $file->name, 'category' => $file->category],
        ]);

        $file->delete();
    }

    public function updateDescription(ServiceFile $file, string $description): ServiceFile
    {
        $file->update(['description' => $description]);
        return $file->fresh()->load('user.profile');
    }

    public function isCategoryAllowedForClient(string $category): bool
    {
        return $category === 'client_files';
    }

    public function getAvailableCategories(): array
    {
        return self::CATEGORIES;
    }
}
