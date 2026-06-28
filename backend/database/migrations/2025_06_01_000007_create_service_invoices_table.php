<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number')->unique();
            $table->foreignUuid('service_order_id')->constrained('service_orders')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('pending');
            $table->decimal('subtotal_ngn', 12, 2)->default(0);
            $table->decimal('subtotal_usd', 10, 2)->default(0);
            $table->decimal('discount_ngn', 12, 2)->default(0);
            $table->decimal('discount_usd', 10, 2)->default(0);
            $table->decimal('tax_ngn', 12, 2)->default(0);
            $table->decimal('tax_usd', 10, 2)->default(0);
            $table->decimal('total_ngn', 12, 2)->default(0);
            $table->decimal('total_usd', 10, 2)->default(0);
            $table->decimal('amount_paid_ngn', 12, 2)->default(0);
            $table->decimal('amount_paid_usd', 10, 2)->default(0);
            $table->decimal('balance_ngn', 12, 2)->default(0);
            $table->decimal('balance_usd', 10, 2)->default(0);
            $table->string('payment_type')->default('full');
            $table->date('due_date')->nullable();
            $table->date('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('invoice_number');
            $table->index('service_order_id');
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_invoices');
    }
};
