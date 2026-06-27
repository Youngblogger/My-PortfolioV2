<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'user_id', 'enrollment_id', 'transaction_reference', 'payment_gateway',
        'amount', 'currency', 'status', 'gateway_response', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'gateway_response' => 'array',
            'metadata' => 'array',
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
        return $this->hasOne(Invoice::class);
    }
}
