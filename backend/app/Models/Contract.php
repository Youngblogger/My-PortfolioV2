<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Contract extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'contract_number', 'proposal_id', 'service_order_id', 'user_id',
        'status', 'scope_of_work', 'deliverables', 'timeline', 'milestones',
        'payment_schedule', 'total_ngn', 'total_usd', 'revision_count',
        'ownership_clause', 'confidentiality_clause', 'warranty_clause', 'cancellation_clause',
        'additional_terms', 'client_signature', 'company_signature',
        'client_signed_at', 'company_signed_at', 'fully_executed_at',
        'metadata', 'version',
    ];

    protected function casts(): array
    {
        return [
            'deliverables' => 'array',
            'milestones' => 'array',
            'payment_schedule' => 'array',
            'total_ngn' => 'decimal:2',
            'total_usd' => 'decimal:2',
            'client_signature' => 'array',
            'company_signature' => 'array',
            'metadata' => 'array',
            'client_signed_at' => 'datetime',
            'company_signed_at' => 'datetime',
            'fully_executed_at' => 'datetime',
        ];
    }

    public function proposal()
    {
        return $this->belongsTo(Proposal::class);
    }

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
