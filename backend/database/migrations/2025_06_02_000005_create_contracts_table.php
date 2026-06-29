<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('contract_number')->unique();
            $table->foreignUuid('proposal_id')->nullable()->constrained('proposals')->nullOnDelete();
            $table->foreignUuid('service_order_id')->constrained('service_orders');
            $table->foreignUuid('user_id')->constrained('users');
            $table->string('status')->default('draft');
            $table->text('scope_of_work');
            $table->json('deliverables');
            $table->text('timeline');
            $table->json('milestones');
            $table->json('payment_schedule');
            $table->decimal('total_ngn', 12, 2)->default(0);
            $table->decimal('total_usd', 10, 2)->default(0);
            $table->integer('revision_count')->default(2);
            $table->text('ownership_clause')->nullable();
            $table->text('confidentiality_clause')->nullable();
            $table->text('warranty_clause')->nullable();
            $table->text('cancellation_clause')->nullable();
            $table->text('additional_terms')->nullable();
            $table->json('client_signature')->nullable();
            $table->json('company_signature')->nullable();
            $table->timestamp('client_signed_at')->nullable();
            $table->timestamp('company_signed_at')->nullable();
            $table->timestamp('fully_executed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('version')->default(1);
            $table->timestamps();

            $table->index('contract_number');
            $table->index('service_order_id');
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
