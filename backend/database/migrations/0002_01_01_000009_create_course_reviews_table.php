<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('course_id')->constrained('courses');
            $table->foreignUuid('user_id')->constrained('profiles');
            $table->integer('rating');
            $table->text('review')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->unique(['course_id', 'user_id']);
            $table->index('course_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_reviews');
    }
};
