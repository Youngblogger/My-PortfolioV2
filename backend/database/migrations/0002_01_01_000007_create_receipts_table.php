<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('receipt_number')->unique();
            $table->string('transaction_reference');
            $table->foreignUuid('user_id')->constrained('profiles');
            $table->foreignUuid('enrollment_id')->nullable()->constrained('enrollments')->nullOnDelete();
            $table->foreignUuid('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->string('course_name');
            $table->string('student_name');
            $table->decimal('amount', 12, 2);
            $table->string('payment_gateway')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('currency')->default('NGN');
            $table->string('status')->default('completed');
            $table->json('receipt_data')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('transaction_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
