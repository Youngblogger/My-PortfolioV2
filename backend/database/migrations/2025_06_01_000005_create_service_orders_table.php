<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number')->unique();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('service_id')->constrained('services');
            $table->foreignUuid('project_type_id')->constrained('project_types');
            $table->foreignUuid('package_id')->constrained('packages');
            $table->string('status')->default('draft');
            $table->decimal('package_price_ngn', 12, 2)->default(0);
            $table->decimal('package_price_usd', 10, 2)->default(0);
            $table->decimal('add_ons_total_ngn', 12, 2)->default(0);
            $table->decimal('add_ons_total_usd', 10, 2)->default(0);
            $table->decimal('discount_ngn', 12, 2)->default(0);
            $table->decimal('discount_usd', 10, 2)->default(0);
            $table->decimal('tax_ngn', 12, 2)->default(0);
            $table->decimal('tax_usd', 10, 2)->default(0);
            $table->decimal('total_ngn', 12, 2)->default(0);
            $table->decimal('total_usd', 10, 2)->default(0);
            $table->string('currency', 3)->default('NGN');
            $table->string('payment_status')->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('payment_gateway')->nullable();
            $table->string('transaction_reference')->nullable();
            $table->text('notes')->nullable();
            $table->json('billing_details')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('order_number');
            $table->index('user_id');
            $table->index('status');
            $table->index('payment_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_orders');
    }
};
