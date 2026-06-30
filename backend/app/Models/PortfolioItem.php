<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PortfolioItem extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'title', 'slug', 'description', 'category', 'technologies', 'images',
        'video_url', 'is_featured', 'is_case_study', 'client_name',
        'completion_date', 'project_url', 'status', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'technologies' => 'array',
            'images' => 'array',
            'is_featured' => 'boolean',
            'is_case_study' => 'boolean',
            'completion_date' => 'date',
            'sort_order' => 'integer',
        ];
    }
}
