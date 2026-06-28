<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServicePayment extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'service_order_id', 'service_invoice_id', 'user_id',
        'reference', 'gateway', 'amount_ngn', 'amount_usd',
        'currency', 'status', 'payment_type',
        'gateway_response', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_ngn' => 'decimal:2',
            'amount_usd' => 'decimal:2',
            'gateway_response' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }

    public function serviceInvoice()
    {
        return $this->belongsTo(ServiceInvoice::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
