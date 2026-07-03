<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Service extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'slug', 'title', 'subtitle', 'short_description', 'description',
        'icon', 'image_url', 'cover_url',
        'starting_price_ngn', 'starting_price_usd',
        'estimated_delivery', 'sort_order', 'is_active',
        'features', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'starting_price_ngn' => 'decimal:2',
            'starting_price_usd' => 'decimal:2',
            'is_active' => 'boolean',
            'features' => 'array',
            'metadata' => 'array',
        ];
    }

    public function projectTypes()
    {
        return $this->hasMany(ProjectType::class);
    }

    public function activeProjectTypes()
    {
        return $this->hasMany(ProjectType::class)->where('is_active', true);
    }


}
