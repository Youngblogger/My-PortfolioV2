<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RequirementQuestion extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'service_id', 'project_type_id', 'question_key', 'question',
        'description', 'type', 'options', 'is_required', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function projectType()
    {
        return $this->belongsTo(ProjectType::class);
    }
}
