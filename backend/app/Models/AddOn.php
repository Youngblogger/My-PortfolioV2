<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AddOn extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'icon',
        'price_ngn', 'price_usd',
        'category', 'metadata', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_ngn' => 'decimal:2',
            'price_usd' => 'decimal:2',
            'is_active' => 'boolean',
            'metadata' => 'array',
        ];
    }
}
