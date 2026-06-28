<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_add_ons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_order_id')->constrained('service_orders')->cascadeOnDelete();
            $table->foreignUuid('add_on_id')->constrained('add_ons');
            $table->string('name');
            $table->decimal('price_ngn', 12, 2)->default(0);
            $table->decimal('price_usd', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['service_order_id', 'add_on_id']);
            $table->index('service_order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_add_ons');
    }
};
