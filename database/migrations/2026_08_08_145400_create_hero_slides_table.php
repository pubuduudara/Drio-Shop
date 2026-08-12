<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hero_slides', function (Blueprint $table): void {
            $table->id();
            $table->json('headline');
            $table->json('subhead')->nullable();

            // CTA labels are copy and translate; hrefs are routes and do not.
            $table->json('primary_cta_label')->nullable();
            $table->string('primary_cta_href')->nullable();
            $table->json('secondary_cta_label')->nullable();
            $table->string('secondary_cta_href')->nullable();

            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hero_slides');
    }
};
