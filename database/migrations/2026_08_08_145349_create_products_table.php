<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->json('name');
            $table->string('slug')->unique();
            $table->json('short_description')->nullable();
            $table->json('description')->nullable();
            $table->string('sku')->unique();

            /*
             * Money is integer minor units, never a float or decimal (§2).
             * JPY has no subunit, so 1580 is ¥1,580.
             */
            $table->unsignedInteger('price_minor');
            $table->unsignedInteger('compare_at_price_minor')->nullable();
            $table->string('currency', 3)->default('JPY');

            $table->unsignedInteger('weight_grams')->nullable();
            $table->integer('stock_quantity')->default(0);

            $table->boolean('is_active')->default(true);
            $table->boolean('is_best_seller')->default(false);
            $table->boolean('is_vegetarian')->default(true);
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'is_best_seller']);
            $table->index(['category_id', 'is_active']);
            // Serves the shop's price filter and sort without a table scan.
            $table->index('price_minor');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
