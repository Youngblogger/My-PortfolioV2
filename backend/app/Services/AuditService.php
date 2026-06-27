<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditService
{
    public function log(
        string $action,
        ?string $userId = null,
        ?string $entityType = null,
        ?string $entityId = null,
        array $metadata = [],
        ?string $ipAddress = null
    ): void {
        AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'metadata' => $metadata,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }
}
