<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\HeroSlide;
use App\Support\Locales;
use Illuminate\Database\Seeder;

/**
 * Three slides, because the mockup's counter reads `01 / 03` (§6).
 *
 * The first reproduces the reference headline exactly. The headline is stored
 * with its line breaks as newlines so the hero can render it across three
 * lines without the component knowing where to split.
 */
class HeroSlideSeeder extends Seeder
{
    public function run(): void
    {
        $locale = Locales::default();

        $slides = [
            [
                'headline' => "Authentic\nSri Lankan Flavours,\nDelivered Across Japan",
                'subhead' => 'Premium dehydrated vegetables, handcrafted spices and authentic Sri Lankan ingredients.',
                'primary_label' => 'Shop Now',
                'primary_href' => '/shop',
                'secondary_label' => 'Explore Products',
                'secondary_href' => '/shop',
            ],
            [
                'headline' => "Dried In The Sun,\nGround By Hand,\nShipped To Your Door",
                'subhead' => 'Small-batch spice blends from families who have made them the same way for generations.',
                'primary_label' => 'Shop Spices',
                'primary_href' => '/shop',
                'secondary_label' => 'Our Story',
                'secondary_href' => '/our-story',
            ],
            [
                'headline' => "The Taste You\nGrew Up With,\nWithout The Flight",
                'subhead' => 'Jackfruit, polos and breadfruit, dried at the peak of season and ready when you are.',
                'primary_label' => 'Shop Vegetables',
                'primary_href' => '/shop',
                'secondary_label' => 'Browse Recipes',
                'secondary_href' => '/recipes',
            ],
        ];

        foreach ($slides as $index => $slide) {
            HeroSlide::query()->updateOrCreate(
                ['sort_order' => $index],
                [
                    'headline' => [$locale => $slide['headline']],
                    'subhead' => [$locale => $slide['subhead']],
                    'primary_cta_label' => [$locale => $slide['primary_label']],
                    'primary_cta_href' => $slide['primary_href'],
                    'secondary_cta_label' => [$locale => $slide['secondary_label']],
                    'secondary_cta_href' => $slide['secondary_href'],
                    'is_active' => true,
                ],
            );
        }
    }
}
