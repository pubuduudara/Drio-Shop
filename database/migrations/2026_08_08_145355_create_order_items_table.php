<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Line items snapshot the product's name, SKU and price at purchase time, so
 * an order stays a faithful record of what was actually bought even after the
 * catalogue is renamed, repriced or soft-deleted (§6).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            // Plain strings, not JSON: a snapshot records what the customer
            // actually saw, in the locale they bought in.
            $table->string('product_name_snapshot');
            $table->string('sku_snapshot');

            $table->unsignedInteger('unit_price_minor');
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('line_total_minor');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
