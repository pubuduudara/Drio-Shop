<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Translatable columns are JSON keyed by locale (§6). They hold one key today
 * and cost nothing, which is the entire point — adding Japanese later is a
 * content task, not a data migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->json('name');
            // Not translatable by design: one canonical slug per record (§6).
            $table->string('slug')->unique();
            $table->json('description')->nullable();
            // Maps to a drawn SVG component: leaf, powder, chilli, spice.
            $table->string('icon_key')->default('leaf');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index(['is_featured', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
