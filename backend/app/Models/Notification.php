<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Notification extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'user_id', 'service_order_id', 'type', 'title', 'body',
        'action_url', 'action_text', 'channel', 'metadata',
        'is_read', 'read_at', 'sent_via_email_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'is_read' => 'boolean',
            'read_at' => 'datetime',
            'sent_via_email_at' => 'datetime',
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
