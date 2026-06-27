<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug')->unique();
            $table->string('stack_id');
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->string('short_description')->nullable();
            $table->string('category')->nullable();
            $table->string('icon')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->string('cover_url')->nullable();

            // Instructor
            $table->foreignUuid('instructor_id')->nullable()->constrained('profiles')->nullOnDelete();
            $table->string('instructor_name')->nullable();
            $table->string('instructor_title')->nullable();
            $table->string('instructor_avatar')->nullable();
            $table->text('instructor_bio')->nullable();
            $table->integer('instructor_experience')->default(0);
            $table->integer('instructor_students')->default(0);
            $table->integer('instructor_courses')->default(1);
            $table->decimal('instructor_rating', 3, 2)->default(0);

            // Course details
            $table->string('duration')->nullable();
            $table->string('skill_level')->nullable();
            $table->string('language')->default('English');
            $table->date('last_updated')->nullable();

            // Features
            $table->boolean('certificate_included')->default(true);
            $table->boolean('lifetime_access')->default(true);
            $table->boolean('mobile_access')->default(true);
            $table->boolean('downloadable_resources')->default(true);
            $table->boolean('projects_included')->default(true);
            $table->boolean('community_access')->default(true);

            // Pricing
            $table->decimal('price_ngn', 12, 2)->default(0);
            $table->decimal('price_usd', 10, 2)->default(0);
            $table->decimal('original_price_ngn', 12, 2)->nullable();
            $table->decimal('original_price_usd', 10, 2)->nullable();
            $table->integer('discount_percentage')->default(0);
            $table->string('currency')->default('NGN');
            $table->boolean('is_free')->default(false);
            $table->boolean('is_published')->default(false);

            // Stats
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            $table->integer('students_enrolled')->default(0);

            // Arrays stored as JSON
            $table->json('what_you_learn')->nullable();
            $table->json('includes')->nullable();
            $table->json('requirements')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index('slug');
            $table->index('stack_id');
            $table->index('is_published');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
