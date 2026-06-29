<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RequirementResponse extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'service_order_id', 'user_id', 'responses', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'responses' => 'array',
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
}
