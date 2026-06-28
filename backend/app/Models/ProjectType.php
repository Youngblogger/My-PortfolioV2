<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProjectType extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'service_id', 'slug', 'title', 'subtitle',
        'short_description', 'description',
        'icon', 'image_url', 'cover_url',
        'starting_price_ngn', 'starting_price_usd',
        'estimated_timeline',
        'features', 'technologies', 'deliverables', 'faqs', 'portfolio_samples',
        'metadata', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'starting_price_ngn' => 'decimal:2',
            'starting_price_usd' => 'decimal:2',
            'is_active' => 'boolean',
            'features' => 'array',
            'technologies' => 'array',
            'deliverables' => 'array',
            'faqs' => 'array',
            'portfolio_samples' => 'array',
            'metadata' => 'array',
        ];
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function packages()
    {
        return $this->hasMany(Package::class);
    }

    public function activePackages()
    {
        return $this->hasMany(Package::class)->where('is_active', true);
    }
}
