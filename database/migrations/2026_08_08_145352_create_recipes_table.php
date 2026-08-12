<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table): void {
            $table->id();
            $table->json('title');
            $table->string('slug')->unique();
            $table->json('intro')->nullable();

            /*
             * Locale-keyed lists: {"en": ["200g dehydrated jackfruit", ...]}.
             * Spatie Translatable resolves the key, leaving an array behind,
             * so a translated recipe can differ in step count from the
             * English one without a schema change.
             */
            $table->json('ingredients')->nullable();
            $table->json('steps')->nullable();

            $table->unsignedInteger('prep_minutes')->nullable();
            $table->unsignedInteger('cook_minutes')->nullable();
            $table->unsignedInteger('serves')->nullable();

            $table->boolean('is_vegetarian')->default(false);
            $table->boolean('is_traditional')->default(false);
            $table->boolean('is_quick')->default(false);
            $table->boolean('is_published')->default(true);

            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_published', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
