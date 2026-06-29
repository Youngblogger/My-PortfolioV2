<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposal_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('proposal_id')->constrained('proposals')->cascadeOnDelete();
            $table->integer('version');
            $table->text('changes_description')->nullable();
            $table->json('snapshot')->nullable();
            $table->foreignUuid('created_by')->constrained('users');
            $table->timestamps();

            $table->unique(['proposal_id', 'version']);
            $table->index('proposal_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposal_versions');
    }
};
