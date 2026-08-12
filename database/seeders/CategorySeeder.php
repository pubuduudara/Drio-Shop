<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Support\Locales;
use Illuminate\Database\Seeder;

/**
 * The four categories the mockup shows (§6). Seeders populate the default
 * locale key only; Japanese values arrive through the admin when that locale
 * is enabled, not through a migration.
 */
class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $locale = Locales::default();

        $categories = [
            [
                'name' => 'Dehydrated Vegetables',
                'slug' => 'dehydrated-vegetables',
                'description' => 'Sun-dried jackfruit, breadfruit and island vegetables, ready for the pot.',
                'icon_key' => 'leaf',
            ],
            [
                'name' => 'Curry Powder',
                'slug' => 'curry-powder',
                'description' => 'Roasted and unroasted blends ground the way our grandmothers did.',
                'icon_key' => 'powder',
            ],
            [
                'name' => 'Chilli Powder',
                'slug' => 'chilli-powder',
                'description' => 'Sun-dried Sri Lankan chillies, from gentle warmth to full heat.',
                'icon_key' => 'chilli',
            ],
            [
                'name' => 'Traditional Ingredients',
                'slug' => 'traditional-ingredients',
                'description' => 'Goraka, pandan, curry leaf and the pantry staples that make it taste like home.',
                'icon_key' => 'spice',
            ],
        ];

        foreach ($categories as $index => $category) {
            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => [$locale => $category['name']],
                    'description' => [$locale => $category['description']],
                    'icon_key' => $category['icon_key'],
                    'sort_order' => $index,
                    'is_featured' => true,
                ],
            );
        }
    }
}
