<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_order_id')->constrained('service_orders')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users');
            $table->text('message');
            $table->json('attachments')->nullable();
            $table->string('type')->default('text');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index('service_order_id');
            $table->index('user_id');
            $table->index('is_read');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_messages');
    }
};
