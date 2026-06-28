<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServiceInvoice extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'invoice_number', 'service_order_id', 'user_id',
        'status', 'subtotal_ngn', 'subtotal_usd',
        'discount_ngn', 'discount_usd', 'tax_ngn', 'tax_usd',
        'total_ngn', 'total_usd', 'amount_paid_ngn', 'amount_paid_usd',
        'balance_ngn', 'balance_usd', 'payment_type',
        'due_date', 'paid_at', 'notes', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_ngn' => 'decimal:2',
            'subtotal_usd' => 'decimal:2',
            'discount_ngn' => 'decimal:2',
            'discount_usd' => 'decimal:2',
            'tax_ngn' => 'decimal:2',
            'tax_usd' => 'decimal:2',
            'total_ngn' => 'decimal:2',
            'total_usd' => 'decimal:2',
            'amount_paid_ngn' => 'decimal:2',
            'amount_paid_usd' => 'decimal:2',
            'balance_ngn' => 'decimal:2',
            'balance_usd' => 'decimal:2',
            'due_date' => 'date',
            'paid_at' => 'date',
            'metadata' => 'array',
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

    public function payments()
    {
        return $this->hasMany(ServicePayment::class);
    }
}
