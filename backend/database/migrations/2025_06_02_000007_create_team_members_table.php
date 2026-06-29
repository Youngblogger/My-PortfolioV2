<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users');
            $table->string('title')->nullable();
            $table->string('role_slug');
            $table->text('bio')->nullable();
            $table->string('avatar_url')->nullable();
            $table->json('skills')->nullable();
            $table->boolean('is_available')->default(true);
            $table->decimal('hourly_rate_ngn', 10, 2)->default(0);
            $table->decimal('hourly_rate_usd', 8, 2)->default(0);
            $table->timestamps();

            $table->index('user_id');
            $table->index('role_slug');
            $table->index('is_available');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
