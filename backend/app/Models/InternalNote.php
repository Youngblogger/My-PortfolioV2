<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalNote extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'service_order_id',
        'user_id',
        'content',
        'edit_history',
    ];

    protected $casts = [
        'edit_history' => 'array',
    ];

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
