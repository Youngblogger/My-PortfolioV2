<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('proposal_number')->unique();
            $table->foreignUuid('service_order_id')->nullable()->constrained('service_orders')->nullOnDelete();
            $table->foreignUuid('user_id')->constrained('users');
            $table->foreignUuid('service_id')->constrained('services');
            $table->foreignUuid('project_type_id')->constrained('project_types');
            $table->foreignUuid('package_id')->nullable()->constrained('packages')->nullOnDelete();
            $table->string('status')->default('draft');
            $table->text('scope_of_work')->nullable();
            $table->json('deliverables')->nullable();
            $table->json('included_features')->nullable();
            $table->json('excluded_items')->nullable();
            $table->text('timeline_description')->nullable();
            $table->json('milestones')->nullable();
            $table->json('payment_schedule')->nullable();
            $table->decimal('total_ngn', 12, 2)->default(0);
            $table->decimal('total_usd', 10, 2)->default(0);
            $table->json('terms_and_conditions')->nullable();
            $table->date('valid_until')->nullable();
            $table->integer('version')->default(1);
            $table->text('notes')->nullable();
            $table->timestamp('client_viewed_at')->nullable();
            $table->timestamp('client_approved_at')->nullable();
            $table->timestamp('client_rejected_at')->nullable();
            $table->timestamps();

            $table->index('proposal_number');
            $table->index('service_order_id');
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};
