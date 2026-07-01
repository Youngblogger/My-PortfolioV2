<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServiceOrder extends Model
{
    use HasUuids, HasFactory;

    const PAYMENT_STATUS_UNPAID = 'pending';
    const PAYMENT_STATUS_PROCESSING = 'processing';
    const PAYMENT_STATUS_DEPOSIT_PAID = 'partially_paid';
    const PAYMENT_STATUS_FULLY_PAID = 'paid';
    const PAYMENT_STATUS_COMPLETED = 'completed';
    const PAYMENT_STATUS_REFUNDED = 'refunded';
    const PAYMENT_STATUS_FAILED = 'failed';

    const PROJECT_STATUS_PENDING = 'pending_review';
    const PROJECT_STATUS_IN_PROGRESS = 'in_progress';
    const PROJECT_STATUS_AWAITING_FEEDBACK = 'awaiting_feedback';
    const PROJECT_STATUS_AWAITING_PAYMENT = 'awaiting_payment';
    const PROJECT_STATUS_AWAITING_COMPLETION = 'awaiting_completion';
    const PROJECT_STATUS_COMPLETED = 'completed';
    const PROJECT_STATUS_DELIVERED = 'delivered';
    const PROJECT_STATUS_ARCHIVED = 'archived';
    const PROJECT_STATUS_CANCELLED = 'cancelled';

    const ORDER_STATUS_LEAD = 'lead';
    const ORDER_STATUS_DISCOVERY = 'discovery';
    const ORDER_STATUS_PROPOSAL = 'proposal';
    const ORDER_STATUS_APPROVED = 'approved';
    const ORDER_STATUS_DEVELOPMENT = 'development';
    const ORDER_STATUS_TESTING = 'testing';
    const ORDER_STATUS_DEPLOYMENT = 'deployment';
    const ORDER_STATUS_COMPLETED = 'completed';

    const INVOICE_STATUS_PENDING = 'pending';
    const INVOICE_STATUS_PARTIALLY_PAID = 'partially_paid';
    const INVOICE_STATUS_PAID = 'paid';

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
        'delivered_at', 'estimated_completion',
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
            'project_created_at' => 'datetime',
            'kickoff_at' => 'datetime',
            'completed_at' => 'datetime',
            'delivered_at' => 'datetime',
            'requirements_reviewed_at' => 'datetime',
            'billing_details' => 'array',
            'metadata' => 'array',
            'estimated_completion' => 'date',
        ];
    }

    public function isFullyPaid(): bool
    {
        return in_array($this->payment_status, [
            self::PAYMENT_STATUS_FULLY_PAID,
            self::PAYMENT_STATUS_COMPLETED,
        ]);
    }

    public function isPartiallyPaid(): bool
    {
        return $this->payment_status === self::PAYMENT_STATUS_DEPOSIT_PAID;
    }

    public function isUnpaid(): bool
    {
        return $this->payment_status === self::PAYMENT_STATUS_UNPAID;
    }

    public function isProjectCompleted(): bool
    {
        return $this->project_status === self::PROJECT_STATUS_COMPLETED;
    }

    public function isProjectDelivered(): bool
    {
        return $this->project_status === self::PROJECT_STATUS_DELIVERED;
    }

    public function isDownloadAllowed(): bool
    {
        return $this->isFullyPaid() && $this->isProjectCompleted();
    }

    public function canDownloadDelivery(): bool
    {
        return $this->isFullyPaid() && ($this->isProjectCompleted() || $this->isProjectDelivered());
    }

    public function getTotalPaidNgn(): float
    {
        return (float) $this->payments()
            ->whereIn('status', ['success', 'completed'])
            ->sum('amount_ngn');
    }

    public function getTotalPaidUsd(): float
    {
        return (float) $this->payments()
            ->whereIn('status', ['success', 'completed'])
            ->sum('amount_usd');
    }

    public function getBalanceNgn(): float
    {
        return max(0, (float) $this->total_ngn - $this->getTotalPaidNgn());
    }

    public function getBalanceUsd(): float
    {
        return max(0, (float) $this->total_usd - $this->getTotalPaidUsd());
    }

    public function getLastPaymentDate()
    {
        return $this->payments()
            ->whereIn('status', ['success', 'completed'])
            ->max('paid_at');
    }

    public function getPaymentTypeLabel(): string
    {
        return $this->metadata['payment_type'] ?? 'full';
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

    public function teamAssignments()
    {
        return $this->hasMany(TeamAssignment::class);
    }

    public function projectManager()
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    public function internalNotes()
    {
        return $this->hasMany(InternalNote::class);
    }

    public function review()
    {
        return $this->hasOne(ProjectReview::class);
    }

    public function scopeByProjectStatus($query, $status)
    {
        return $query->where('project_status', $status);
    }

    public function scopeFullyPaid($query)
    {
        return $query->whereIn('payment_status', [self::PAYMENT_STATUS_FULLY_PAID, self::PAYMENT_STATUS_COMPLETED]);
    }

    public function scopeDownloadable($query)
    {
        return $query->whereIn('payment_status', [self::PAYMENT_STATUS_FULLY_PAID, self::PAYMENT_STATUS_COMPLETED])
            ->where('project_status', self::PROJECT_STATUS_COMPLETED);
    }
}
