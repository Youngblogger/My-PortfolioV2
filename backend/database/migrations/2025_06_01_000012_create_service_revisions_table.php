<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_revisions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_order_id')->constrained('service_orders')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users');
            $table->string('title');
            $table->text('description');
            $table->string('status')->default('pending');
            $table->json('attachments')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('service_order_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_revisions');
    }
};
