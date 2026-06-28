<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_order_id')->constrained('service_orders')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('path');
            $table->string('type')->nullable();
            $table->integer('size')->default(0);
            $table->string('category')->default('general');
            $table->timestamps();

            $table->index('service_order_id');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_files');
    }
};
