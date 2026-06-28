<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_order_id')->constrained('service_orders')->cascadeOnDelete();
            $table->foreignUuid('service_invoice_id')->nullable()->constrained('service_invoices')->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reference')->unique();
            $table->string('gateway');
            $table->decimal('amount_ngn', 12, 2)->default(0);
            $table->decimal('amount_usd', 10, 2)->default(0);
            $table->string('currency', 3)->default('NGN');
            $table->string('status')->default('pending');
            $table->string('payment_type')->default('full');
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('reference');
            $table->index('service_order_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_payments');
    }
};
