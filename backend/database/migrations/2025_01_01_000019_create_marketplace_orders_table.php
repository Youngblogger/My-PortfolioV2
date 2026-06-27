<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('buyer_id');
            $table->uuid('listing_id');
            $table->uuid('seller_id');
            $table->string('order_number')->unique();
            $table->decimal('amount', 12, 2);
            $table->string('currency')->default('NGN');
            $table->string('status')->default('pending');
            $table->string('payment_status')->default('unpaid');
            $table->string('payment_reference')->nullable();
            $table->string('payment_gateway')->nullable();
            $table->json('delivery_info')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->foreign('buyer_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('listing_id')->references('id')->on('marketplace_listings')->cascadeOnDelete();
            $table->foreign('seller_id')->references('id')->on('seller_profiles')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_orders');
    }
};
