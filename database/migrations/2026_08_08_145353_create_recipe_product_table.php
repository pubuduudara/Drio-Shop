<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Links a recipe to the products it uses, which is what powers the "shop the
 * ingredients" block on a recipe page (§7.12).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipe_product', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('recipe_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['recipe_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_product');
    }
};
