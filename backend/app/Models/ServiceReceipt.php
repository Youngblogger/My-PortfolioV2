<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServiceReceipt extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'receipt_number', 'service_order_id', 'service_invoice_id',
        'service_payment_id', 'user_id',
        'amount_ngn', 'amount_usd', 'currency',
        'payment_gateway', 'payment_type', 'status', 'receipt_data',
    ];

    protected function casts(): array
    {
        return [
            'amount_ngn' => 'decimal:2',
            'amount_usd' => 'decimal:2',
            'receipt_data' => 'array',
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

    public function servicePayment()
    {
        return $this->belongsTo(ServicePayment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
