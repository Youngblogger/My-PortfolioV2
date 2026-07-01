<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $table->timestamp('delivered_at')->nullable()->after('completed_at');
            $table->index('payment_status');
            $table->index(['payment_status', 'project_status']);
        });
    }

    public function down(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $table->dropColumn('delivered_at');
            $table->dropIndex(['payment_status']);
            $table->dropIndex(['payment_status', 'project_status']);
        });
    }
};
