<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_type_id')->constrained('project_types')->cascadeOnDelete();
            $table->string('slug');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price_ngn', 12, 2)->default(0);
            $table->decimal('price_usd', 10, 2)->default(0);
            $table->string('estimated_timeline')->nullable();
            $table->string('support_period')->nullable();
            $table->integer('revision_count')->default(0);
            $table->boolean('is_recommended')->default(false);
            $table->json('features')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['project_type_id', 'slug']);
            $table->index('is_active');
            $table->index('is_recommended');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
