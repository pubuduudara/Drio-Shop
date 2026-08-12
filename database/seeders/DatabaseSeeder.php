<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * Reproduces the reference mockup's content so the built UI is directly
 * comparable to it (§6).
 *
 * Every seeder is idempotent — they all use `updateOrCreate` on a natural key —
 * so re-running against an existing database refreshes content rather than
 * duplicating it.
 */
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            SettingSeeder::class,
            // Categories before products: products resolve their category by slug.
            CategorySeeder::class,
            ProductSeeder::class,
            // Recipes after products: the pivot links them by slug.
            RecipeSeeder::class,
            ReviewSeeder::class,
            HeroSlideSeeder::class,
        ]);
    }
}
