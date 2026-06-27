<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Invoice extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'invoice_number', 'user_id', 'enrollment_id', 'transaction_id',
        'course_name', 'student_name', 'student_email',
        'payment_gateway', 'payment_method',
        'subtotal', 'discount_amount', 'discount_code',
        'tax_amount', 'tax_rate', 'grand_total', 'currency',
        'status', 'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(Profile::class, 'user_id');
    }

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function receipt()
    {
        return $this->hasOne(Receipt::class);
    }
}
