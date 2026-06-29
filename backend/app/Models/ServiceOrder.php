<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServiceOrder extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'order_number', 'project_number', 'user_id', 'service_id', 'project_type_id', 'package_id',
        'status', 'project_status', 'project_manager_id',
        'package_price_ngn', 'package_price_usd',
        'add_ons_total_ngn', 'add_ons_total_usd',
        'discount_ngn', 'discount_usd', 'tax_ngn', 'tax_usd',
        'total_ngn', 'total_usd', 'currency',
        'payment_status', 'payment_method', 'payment_gateway',
        'transaction_reference', 'notes', 'billing_details', 'metadata',
        'requirements_reviewed_at', 'kickoff_at', 'project_created_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'package_price_ngn' => 'decimal:2',
            'package_price_usd' => 'decimal:2',
            'add_ons_total_ngn' => 'decimal:2',
            'add_ons_total_usd' => 'decimal:2',
            'discount_ngn' => 'decimal:2',
            'discount_usd' => 'decimal:2',
            'tax_ngn' => 'decimal:2',
            'tax_usd' => 'decimal:2',
            'total_ngn' => 'decimal:2',
            'total_usd' => 'decimal:2',
            'billing_details' => 'array',
            'metadata' => 'array',
        ];
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

    public function addOns()
    {
        return $this->hasMany(OrderAddOn::class);
    }

    public function invoices()
    {
        return $this->hasMany(ServiceInvoice::class);
    }

    public function payments()
    {
        return $this->hasMany(ServicePayment::class);
    }

    public function milestones()
    {
        return $this->hasMany(Milestone::class);
    }

    public function messages()
    {
        return $this->hasMany(ServiceMessage::class);
    }

    public function files()
    {
        return $this->hasMany(ServiceFile::class);
    }

    public function revisions()
    {
        return $this->hasMany(ServiceRevision::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ServiceActivityLog::class);
    }

    public function receipts()
    {
        return $this->hasMany(ServiceReceipt::class);
    }

    public function projectManager()
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    public function scopeByProjectStatus($query, $status)
    {
        return $query->where('project_status', $status);
    }
}
