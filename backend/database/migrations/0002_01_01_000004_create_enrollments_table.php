<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('profiles');
            $table->foreignUuid('course_id')->constrained('courses');
            $table->foreignUuid('tier_id')->nullable()->constrained('pricing_tiers')->nullOnDelete();
            $table->string('enrollment_number')->unique();
            $table->string('status')->default('active');
            $table->decimal('progress', 5, 2)->default(0);
            $table->string('certificate_url')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'course_id']);
            $table->index('user_id');
            $table->index('course_id');
            $table->index('status');
            $table->index('enrollment_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
