<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $table->string('project_number')->nullable()->unique()->after('order_number');
            $table->string('project_status')->default('pending_review')->after('status');
            $table->foreignUuid('project_manager_id')->nullable()->constrained('users')->nullOnDelete()->after('project_status');
            $table->timestamp('requirements_reviewed_at')->nullable()->after('payment_status');
            $table->timestamp('kickoff_at')->nullable()->after('requirements_reviewed_at');
            $table->timestamp('project_created_at')->nullable()->after('kickoff_at');
            $table->timestamp('completed_at')->nullable()->after('project_created_at');

            $table->index('project_number');
            $table->index('project_status');
        });
    }

    public function down(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $table->dropColumn([
                'project_number',
                'project_status',
                'project_manager_id',
                'requirements_reviewed_at',
                'kickoff_at',
                'project_created_at',
                'completed_at',
            ]);
        });
    }
};
