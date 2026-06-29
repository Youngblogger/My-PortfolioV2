<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            $table->string('milestone_type')->nullable()->after('title');
            $table->boolean('is_automatic')->default(true)->after('status');
            $table->text('completion_notes')->nullable()->after('completed_at');

            $table->index('milestone_type');
            $table->index('is_automatic');
        });
    }

    public function down(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            $table->dropColumn(['milestone_type', 'is_automatic', 'completion_notes']);
        });
    }
};
