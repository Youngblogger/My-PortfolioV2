<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('short_description')->nullable();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('image_url')->nullable();
            $table->string('cover_url')->nullable();
            $table->decimal('starting_price_ngn', 12, 2)->default(0);
            $table->decimal('starting_price_usd', 10, 2)->default(0);
            $table->string('estimated_timeline')->nullable();
            $table->json('features')->nullable();
            $table->json('technologies')->nullable();
            $table->json('deliverables')->nullable();
            $table->json('faqs')->nullable();
            $table->json('portfolio_samples')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('slug');
            $table->index('service_id');
            $table->index('is_active');
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_types');
    }
};
