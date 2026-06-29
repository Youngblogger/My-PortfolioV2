<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TeamAssignment extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'service_order_id', 'team_member_id', 'role', 'status',
        'assigned_at', 'unassigned_at',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'unassigned_at' => 'datetime',
        ];
    }

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }

    public function teamMember()
    {
        return $this->belongsTo(TeamMember::class);
    }
}
