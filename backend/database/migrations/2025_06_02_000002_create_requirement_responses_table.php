<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('requirement_responses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_order_id')->constrained('service_orders')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('responses')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('service_order_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('requirement_responses');
    }
};
