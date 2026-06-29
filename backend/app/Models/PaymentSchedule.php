<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentSchedule extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'service_order_id', 'service_invoice_id', 'title', 'description',
        'percentage', 'amount_ngn', 'amount_usd', 'status', 'due_date', 'paid_at', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'percentage' => 'decimal:2',
            'amount_ngn' => 'decimal:2',
            'amount_usd' => 'decimal:2',
            'due_date' => 'date',
            'paid_at' => 'date',
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
}
