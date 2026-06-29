<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            $table->timestamp('review_requested_at')->nullable()->after('completion_notes');
            $table->string('review_status')->nullable()->after('review_requested_at');
            $table->text('review_feedback')->nullable()->after('review_status');
        });
    }

    public function down(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            $table->dropColumn(['review_requested_at', 'review_status', 'review_feedback']);
        });
    }
};
