<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Proposal extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'proposal_number', 'service_order_id', 'user_id', 'service_id', 'project_type_id', 'package_id',
        'status', 'scope_of_work', 'deliverables', 'included_features', 'excluded_items',
        'timeline_description', 'milestones', 'payment_schedule',
        'total_ngn', 'total_usd', 'terms_and_conditions', 'valid_until',
        'version', 'notes',
        'client_viewed_at', 'client_approved_at', 'client_rejected_at',
    ];

    protected function casts(): array
    {
        return [
            'deliverables' => 'array',
            'included_features' => 'array',
            'excluded_items' => 'array',
            'milestones' => 'array',
            'payment_schedule' => 'array',
            'terms_and_conditions' => 'array',
            'total_ngn' => 'decimal:2',
            'total_usd' => 'decimal:2',
            'valid_until' => 'date',
            'client_viewed_at' => 'datetime',
            'client_approved_at' => 'datetime',
            'client_rejected_at' => 'datetime',
        ];
    }

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function projectType()
    {
        return $this->belongsTo(ProjectType::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function versions()
    {
        return $this->hasMany(ProposalVersion::class);
    }

    public function contract()
    {
        return $this->hasOne(Contract::class);
    }
}
