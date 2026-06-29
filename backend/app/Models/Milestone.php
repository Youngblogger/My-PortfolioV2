<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Milestone extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'service_order_id', 'title', 'description', 'milestone_type',
        'status', 'is_automatic', 'sort_order', 'due_date', 'completed_at',
        'deliverables', 'completion_notes', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'completed_at' => 'date',
            'deliverables' => 'array',
            'is_automatic' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }
}
