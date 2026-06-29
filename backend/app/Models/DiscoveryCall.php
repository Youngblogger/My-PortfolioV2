<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DiscoveryCall extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'user_id', 'service_order_id', 'status',
        'preferred_date', 'preferred_time', 'timezone', 'meeting_type',
        'project_summary', 'meeting_link', 'admin_notes',
        'scheduled_at', 'completed_at', 'cancelled_at', 'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'scheduled_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }
}
