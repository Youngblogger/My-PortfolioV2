<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderAddOn extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'service_order_id', 'add_on_id', 'name', 'price_ngn', 'price_usd',
    ];

    protected function casts(): array
    {
        return [
            'price_ngn' => 'decimal:2',
            'price_usd' => 'decimal:2',
        ];
    }

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }

    public function addOn()
    {
        return $this->belongsTo(AddOn::class);
    }
}
