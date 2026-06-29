<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('service_order_id')->constrained('service_orders')->cascadeOnDelete();
            $table->foreignUuid('team_member_id')->constrained('team_members');
            $table->string('role');
            $table->string('status')->default('active');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('unassigned_at')->nullable();
            $table->timestamps();

            $table->index('service_order_id');
            $table->index('team_member_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_assignments');
    }
};
