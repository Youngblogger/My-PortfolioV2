<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_listings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('seller_id');
            $table->uuid('category_id');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('type');
            $table->decimal('price_ngn', 12, 2)->default(0);
            $table->decimal('price_usd', 10, 2)->default(0);
            $table->string('currency')->default('NGN');
            $table->json('media')->nullable();
            $table->json('tags')->nullable();
            $table->string('status')->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->integer('views')->default(0);
            $table->timestamps();

            $table->foreign('seller_id')->references('id')->on('seller_profiles')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('marketplace_categories')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_listings');
    }
};
