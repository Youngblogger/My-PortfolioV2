<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requirement_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_id')->nullable()->constrained('services')->cascadeOnDelete();
            $table->foreignUuid('project_type_id')->nullable()->constrained('project_types')->cascadeOnDelete();
            $table->string('question_key')->unique();
            $table->string('question');
            $table->text('description')->nullable();
            $table->string('type')->default('text');
            $table->json('options')->nullable();
            $table->boolean('is_required')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('service_id');
            $table->index('project_type_id');
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requirement_questions');
    }
};
