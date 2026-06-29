<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_order_id')->constrained('service_orders')->cascadeOnDelete();
            $table->foreignUuid('service_invoice_id')->nullable()->constrained('service_invoices')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('percentage', 5, 2)->default(0);
            $table->decimal('amount_ngn', 12, 2)->default(0);
            $table->decimal('amount_usd', 10, 2)->default(0);
            $table->string('status')->default('pending');
            $table->date('due_date')->nullable();
            $table->date('paid_at')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('service_order_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_schedules');
    }
};
