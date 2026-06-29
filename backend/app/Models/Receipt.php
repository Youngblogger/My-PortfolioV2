<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Receipt extends Model
{
    use HasUuids, HasFactory, SoftDeletes;

    protected $fillable = [
        'receipt_number', 'transaction_reference', 'user_id', 'enrollment_id',
        'invoice_id', 'course_name', 'student_name', 'amount',
        'payment_gateway', 'payment_method', 'currency', 'status', 'receipt_data',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'receipt_data' => 'array',
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

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
