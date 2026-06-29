<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('receipt_number')->unique();
            $table->foreignUuid('service_order_id')->constrained('service_orders')->cascadeOnDelete();
            $table->foreignUuid('service_invoice_id')->nullable()->constrained('service_invoices')->nullOnDelete();
            $table->foreignUuid('service_payment_id')->nullable()->constrained('service_payments')->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('amount_ngn', 12, 2)->default(0);
            $table->decimal('amount_usd', 10, 2)->default(0);
            $table->string('currency', 3)->default('NGN');
            $table->string('payment_gateway')->nullable();
            $table->string('payment_type')->default('full');
            $table->string('status')->default('completed');
            $table->json('receipt_data')->nullable();
            $table->timestamps();

            $table->index('receipt_number');
            $table->index('service_order_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_receipts');
    }
};
