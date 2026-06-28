<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Package extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'project_type_id', 'slug', 'name', 'description',
        'price_ngn', 'price_usd',
        'estimated_timeline', 'support_period', 'revision_count',
        'is_recommended', 'features', 'metadata', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_ngn' => 'decimal:2',
            'price_usd' => 'decimal:2',
            'is_recommended' => 'boolean',
            'is_active' => 'boolean',
            'features' => 'array',
            'metadata' => 'array',
        ];
    }

    public function projectType()
    {
        return $this->belongsTo(ProjectType::class);
    }
}
