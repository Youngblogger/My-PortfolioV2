<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discovery_calls', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users');
            $table->foreignUuid('service_order_id')->nullable()->constrained('service_orders')->nullOnDelete();
            $table->string('status')->default('pending');
            $table->date('preferred_date');
            $table->string('preferred_time');
            $table->string('timezone')->default('Africa/Lagos');
            $table->string('meeting_type')->default('google_meet');
            $table->text('project_summary')->nullable();
            $table->string('meeting_link')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('preferred_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discovery_calls');
    }
};
