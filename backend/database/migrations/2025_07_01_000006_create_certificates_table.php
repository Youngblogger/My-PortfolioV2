<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('enrollment_id')->constrained('enrollments')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('certificate_number')->unique();
            $table->timestamp('issued_at')->nullable();
            $table->string('file_url')->nullable();
            $table->timestamps();

            $table->index('enrollment_id');
            $table->index('user_id');
            $table->index('course_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
